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
    .select("id, profile_id, status")
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
    step_key: "extract",
    level: "info",
    message: "Extrayendo hechos y pretensión del documento…",
  });

  await supabase.from("mission_runs").update({
    status: "running",
    current_step: "extract",
  }).eq("id", body.run_id);

  // Artefacto semántico (demo / fallback sin LLM)
  const extractorOutput = {
    agent: "extractor-ius-basic",
    version: 1,
    parties: [
      { role: "Licensor", label: "Licensor" },
      { role: "Company", label: "Company" },
    ],
    facts: [
      "Licencia perpetua, exclusiva e irrevocable sobre datos personales (PII).",
      "Pago único de 200 EUR como contraprestación.",
    ],
    claim: "Pago único de 200 EUR por la licencia otorgada.",
    raw_notes: "Salida determinística para desarrollo; conectar LLM vía OPENAI_API_KEY.",
  };

  await supabase.from("mission_step_events").insert({
    run_id: body.run_id,
    step_key: "extract",
    level: "info",
    message: "Extracción completada. Partes genéricas y pretensión identificadas.",
  });

  await supabase.from("mission_runs").update({
    extractor_output: extractorOutput as unknown as Record<string, unknown>,
    context_artifact: { parties: extractorOutput.parties } as Record<
      string,
      unknown
    >,
    status: "running",
    current_step: "extract",
  }).eq("id", body.run_id);

  return jsonResponse({ ok: true, extractor_output: extractorOutput });
});
