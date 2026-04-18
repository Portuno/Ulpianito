"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getServerProfile } from "@/lib/auth/profile";
import { invokeEdgeFunction } from "@/lib/ius/edge-invoke";

export type ActionState = { error: string | null; ok?: boolean };

export const createMissionRun = async (
  missionId: string,
  expedienteId?: string | null,
  documentoId?: string | null
): Promise<{ error: string | null; runId?: string }> => {
  const { userId, profile } = await getServerProfile();
  if (!userId || !profile) {
    return { error: "No autenticado" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mission_runs")
    .insert({
      mission_id: missionId,
      profile_id: userId,
      despacho_id: profile.despacho_id,
      expediente_id: expedienteId ?? null,
      documento_id: documentoId ?? null,
      status: "draft",
      current_step: "extract",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/misiones");
  return { error: null, runId: data.id };
};

export const runExtractionAndValidation = async (
  runId: string
): Promise<ActionState> => {
  const { userId } = await getServerProfile();
  if (!userId) {
    return { error: "No autenticado" };
  }

  const supabase = await createClient();

  await invokeEdgeFunction("extractor-ius-basic", { run_id: runId });

  const { error: claimErr } = await supabase.rpc("claim_mission_step_reward", {
    p_run_id: runId,
    p_action_key: "mission_step_extract",
  });
  if (claimErr) {
    return { error: claimErr.message };
  }

  await invokeEdgeFunction("validator-ius-entities", { run_id: runId });

  revalidatePath(`/misiones/runs/${runId}`);
  revalidatePath("/misiones");
  revalidatePath("/dashboard");
  return { error: null, ok: true };
};

export type HitlPayload = {
  licensorLabel: string;
  companyLabel: string;
  riskAcknowledged: boolean;
  economicAlertNotes: string;
  notes: string;
};

export const submitHitlReview = async (
  runId: string,
  payload: HitlPayload
): Promise<ActionState> => {
  const { userId } = await getServerProfile();
  if (!userId) {
    return { error: "No autenticado" };
  }

  const supabase = await createClient();

  const entityMapping = {
    Licensor: payload.licensorLabel,
    Company: payload.companyLabel,
  };

  const { error: hitlErr } = await supabase.from("hitl_reviews").insert({
    run_id: runId,
    reviewed_by: userId,
    action: "approve",
    entity_mapping: entityMapping,
    risk_acknowledged: payload.riskAcknowledged,
    economic_alert_notes: payload.economicAlertNotes || null,
    notes: payload.notes || null,
  });

  if (hitlErr) {
    return { error: hitlErr.message };
  }

  const { data: run } = await supabase
    .from("mission_runs")
    .select("extractor_output, validator_output")
    .eq("id", runId)
    .single();

  const contextArtifact = {
    parties: [
      { role: "Licensor", name: payload.licensorLabel },
      { role: "Company", name: payload.companyLabel },
    ],
    curated: true,
    prior_extractor: run?.extractor_output ?? {},
    prior_validator: run?.validator_output ?? {},
  };

  const { error: updErr } = await supabase
    .from("mission_runs")
    .update({
      context_artifact: contextArtifact,
      status: "running",
      current_step: "plan_write",
    })
    .eq("id", runId);

  if (updErr) {
    return { error: updErr.message };
  }

  const { error: claimErr } = await supabase.rpc("claim_mission_step_reward", {
    p_run_id: runId,
    p_action_key: "mission_step_hitl",
  });
  if (claimErr) {
    return { error: claimErr.message };
  }

  revalidatePath(`/misiones/runs/${runId}`);
  revalidatePath("/dashboard");
  return { error: null, ok: true };
};

export const runPlannerStep = async (runId: string): Promise<ActionState> => {
  const { userId } = await getServerProfile();
  if (!userId) {
    return { error: "No autenticado" };
  }

  await invokeEdgeFunction("planner-ius", { run_id: runId });
  revalidatePath(`/misiones/runs/${runId}`);
  return { error: null, ok: true };
};

export const runWriterStep = async (runId: string): Promise<ActionState> => {
  const { userId } = await getServerProfile();
  if (!userId) {
    return { error: "No autenticado" };
  }

  const supabase = await createClient();

  await invokeEdgeFunction("writer-ius-document", { run_id: runId });

  const { error: claimErr } = await supabase.rpc("claim_mission_step_reward", {
    p_run_id: runId,
    p_action_key: "mission_step_plan_write",
  });
  if (claimErr) {
    return { error: claimErr.message };
  }

  revalidatePath(`/misiones/runs/${runId}`);
  revalidatePath("/dashboard");
  return { error: null, ok: true };
};

export type TrainingPayload = {
  understoodSublicenseTrap: boolean;
  comments: string;
  status: "approved" | "needs_work";
};

export const submitTrainingReview = async (
  runId: string,
  payload: TrainingPayload
): Promise<ActionState> => {
  const { userId, isAdmin } = await getServerProfile();
  if (!userId || !isAdmin) {
    return { error: "Solo un administrador puede revisar el entrenamiento" };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("training_reviews")
    .select("id")
    .eq("run_id", runId)
    .maybeSingle();

  if (existing?.id) {
    const { error: upd } = await supabase
      .from("training_reviews")
      .update({
        understood_sublicense_trap: payload.understoodSublicenseTrap,
        comments: payload.comments,
        status: payload.status,
      })
      .eq("id", existing.id);
    if (upd) {
      return { error: upd.message };
    }
  } else {
    const { error: ins } = await supabase.from("training_reviews").insert({
      run_id: runId,
      reviewer_id: userId,
      understood_sublicense_trap: payload.understoodSublicenseTrap,
      comments: payload.comments,
      status: payload.status,
    });
    if (ins) {
      return { error: ins.message };
    }
  }

  const nextStatus =
    payload.status === "approved" ? "training_done" : "training_pending";

  const { error: runErr } = await supabase
    .from("mission_runs")
    .update({
      status: nextStatus,
      current_step: payload.status === "approved" ? "done" : "training_review",
    })
    .eq("id", runId);

  if (runErr) {
    return { error: runErr.message };
  }

  if (payload.status === "approved") {
    const { error: claimErr } = await supabase.rpc(
      "claim_mission_step_reward",
      {
        p_run_id: runId,
        p_action_key: "mission_training_approved",
      }
    );
    if (claimErr) {
      return { error: claimErr.message };
    }
  }

  revalidatePath(`/misiones/runs/${runId}`);
  revalidatePath("/admin/revisiones");
  revalidatePath("/dashboard");
  return { error: null, ok: true };
};
