import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createUserSupabase } from "../_shared/supabase-user.ts";

type Body = { run_id: string };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonResponse({ error: "JSON inválido" }, 400);
  }

  if (!body.run_id) {
    return jsonResponse({ error: "run_id requerido" }, 400);
  }

  const supabase = createUserSupabase(req);

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: "No autenticado" }, 401);
  }

  const { data: run, error: runErr } = await supabase
    .from("mission_runs")
    .select("id, profile_id, extractor_output")
    .eq("id", body.run_id)
    .single();

  if (runErr || !run) {
    return jsonResponse({ error: "Run no encontrado" }, 404);
  }
  if (run.profile_id !== user.id) {
    return jsonResponse({ error: "No autorizado" }, 403);
  }

  await supabase.from("mission_step_events").insert({
    run_id: body.run_id,
    step_key: "validate",
    level: "info",
    message: "Validando coherencia económica y riesgos contractuales…",
  });

  const economicRisk =
    "Monto de 200 EUR frente a licencia perpetua, exclusiva e irrevocable con PII: posible desalineación de valor/riesgo (revisión humana recomendada).";

  const validatorOutput = {
    agent: "validator-ius-entities",
    version: 1,
    economic_risk_alert: true,
    economic_risk_summary: economicRisk,
    sublicense_trap_note:
      "Verificar cláusulas de sublicencias ilimitadas y responsabilidad sobre datos.",
    requires_hitl: true,
  };

  await supabase.from("mission_step_events").insert({
    run_id: body.run_id,
    step_key: "validate",
    level: "warn",
    message: economicRisk,
  });

  await supabase.from("mission_runs").update({
    validator_output: validatorOutput as unknown as Record<string, unknown>,
    status: "needs_human",
    current_step: "hitl",
  }).eq("id", body.run_id);

  return jsonResponse({ ok: true, validator_output: validatorOutput });
});
