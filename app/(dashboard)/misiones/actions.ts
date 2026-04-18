"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getServerProfile } from "@/lib/auth/profile";
import { invokeEdgeFunction } from "@/lib/ius/edge-invoke";
import type { Database } from "@/lib/types/database";

export type ActionState = { error: string | null; ok?: boolean };
type MissionRunInsert = Database["public"]["Tables"]["mission_runs"]["Insert"];
type MissionRunUpdate = Database["public"]["Tables"]["mission_runs"]["Update"];
type HitlReviewInsert = Database["public"]["Tables"]["hitl_reviews"]["Insert"];
type TrainingReviewInsert = Database["public"]["Tables"]["training_reviews"]["Insert"];
type TrainingReviewUpdate = Database["public"]["Tables"]["training_reviews"]["Update"];
type MissionRunContextFields = Pick<
  Database["public"]["Tables"]["mission_runs"]["Row"],
  "extractor_output" | "validator_output"
>;
type TrainingReviewIdRow = Pick<
  Database["public"]["Tables"]["training_reviews"]["Row"],
  "id"
>;
type ClaimMissionStepRewardArgs =
  Database["public"]["Functions"]["claim_mission_step_reward"]["Args"];

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
  const runInsert: MissionRunInsert = {
      mission_id: missionId,
      profile_id: userId,
      despacho_id: profile.despacho_id,
      expediente_id: expedienteId ?? null,
      documento_id: documentoId ?? null,
      status: "draft",
      current_step: "extract",
    };
  const { data, error } = await supabase
    .from("mission_runs")
    .insert(runInsert)
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

  const claimPayload: ClaimMissionStepRewardArgs = {
    p_run_id: runId,
    p_action_key: "mission_step_extract",
  };
  const { error: claimErr } = await supabase.rpc(
    "claim_mission_step_reward",
    claimPayload
  );
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

  const hitlInsert: HitlReviewInsert = {
    run_id: runId,
    reviewed_by: userId,
    action: "approve",
    entity_mapping: entityMapping,
    risk_acknowledged: payload.riskAcknowledged,
    economic_alert_notes: payload.economicAlertNotes || null,
    notes: payload.notes || null,
  };
  const { error: hitlErr } = await supabase.from("hitl_reviews").insert(hitlInsert);

  if (hitlErr) {
    return { error: hitlErr.message };
  }

  const { data: runData } = await supabase
    .from("mission_runs")
    .select("extractor_output, validator_output")
    .eq("id", runId)
    .single();
  const run = (runData as MissionRunContextFields | null) ?? null;

  const contextArtifact = {
    parties: [
      { role: "Licensor", name: payload.licensorLabel },
      { role: "Company", name: payload.companyLabel },
    ],
    curated: true,
    prior_extractor: run?.extractor_output ?? {},
    prior_validator: run?.validator_output ?? {},
  };

  const runPatch: MissionRunUpdate = {
      context_artifact: contextArtifact,
      status: "running",
      current_step: "plan_write",
    };
  const { error: updErr } = await supabase
    .from("mission_runs")
    .update(runPatch)
    .eq("id", runId);

  if (updErr) {
    return { error: updErr.message };
  }

  const claimPayload: ClaimMissionStepRewardArgs = {
    p_run_id: runId,
    p_action_key: "mission_step_hitl",
  };
  const { error: claimErr } = await supabase.rpc(
    "claim_mission_step_reward",
    claimPayload
  );
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

  const claimPayload: ClaimMissionStepRewardArgs = {
    p_run_id: runId,
    p_action_key: "mission_step_plan_write",
  };
  const { error: claimErr } = await supabase.rpc(
    "claim_mission_step_reward",
    claimPayload
  );
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

  const { data: existingData } = await supabase
    .from("training_reviews")
    .select("id")
    .eq("run_id", runId)
    .maybeSingle();
  const existing = (existingData as TrainingReviewIdRow | null) ?? null;

  if (existing?.id) {
    const trainingPatch: TrainingReviewUpdate = {
      understood_sublicense_trap: payload.understoodSublicenseTrap,
      comments: payload.comments,
      status: payload.status,
    };
    const { error: upd } = await supabase
      .from("training_reviews")
      .update(trainingPatch)
      .eq("id", existing.id);
    if (upd) {
      return { error: upd.message };
    }
  } else {
    const trainingInsert: TrainingReviewInsert = {
      run_id: runId,
      reviewer_id: userId,
      understood_sublicense_trap: payload.understoodSublicenseTrap,
      comments: payload.comments,
      status: payload.status,
    };
    const { error: ins } = await supabase
      .from("training_reviews")
      .insert(trainingInsert);
    if (ins) {
      return { error: ins.message };
    }
  }

  const nextStatus =
    payload.status === "approved" ? "training_done" : "training_pending";

  const runStatusPatch: MissionRunUpdate = {
      status: nextStatus,
      current_step: payload.status === "approved" ? "done" : "training_review",
    };
  const { error: runErr } = await supabase
    .from("mission_runs")
    .update(runStatusPatch)
    .eq("id", runId);

  if (runErr) {
    return { error: runErr.message };
  }

  if (payload.status === "approved") {
    const claimPayload: ClaimMissionStepRewardArgs = {
      p_run_id: runId,
      p_action_key: "mission_training_approved",
    };
    const { error: claimErr } = await supabase.rpc(
      "claim_mission_step_reward",
      claimPayload
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
