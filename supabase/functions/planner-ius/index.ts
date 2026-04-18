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
    .select("id, profile_id, context_artifact")
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
    step_key: "plan",
    level: "info",
    message: "Planificando contraoferta basada en modelo Data as a Service (DaaS)…",
  });

  const plannerOutput = {
    agent: "planner-ius",
    version: 1,
    strategy:
      "Proponer licencia no exclusiva por plazo acotado (ej. 24 meses), límites de uso de datos y responsabilidad mutua.",
    daas_points: [
      "Métricas de uso y auditoría de accesos a PII.",
      "Niveles de servicio y retención acorde al tratamiento.",
    ],
    suggested_terms: [
      "Licencia no exclusiva por 2 años, renovable.",
      "Limitación de responsabilidad recíproca y exclusiones por fuerza mayor.",
    ],
  };

  await supabase.from("mission_runs").update({
    planner_output: plannerOutput as unknown as Record<string, unknown>,
    current_step: "plan_write",
    status: "running",
  }).eq("id", body.run_id);

  return jsonResponse({ ok: true, planner_output: plannerOutput });
});
