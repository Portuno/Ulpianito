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
    .select("id, profile_id, planner_output")
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
    step_key: "write",
    level: "info",
    message: "Redactando borrador de correo de negociación…",
  });

  const draftEmail =
    `Estimado equipo comercial,\n\n` +
    `Tras revisar la propuesta, consideramos que una licencia perpetua y exclusiva con tratamiento intensivo de datos personales no puede sustentarse en un pago único de 200 EUR sin un marco de riesgo y gobernanza acorde.\n\n` +
    `Proponemos avanzar hacia una licencia no exclusiva por 2 años, con modelo Data as a Service: métricas de uso, auditoría de accesos y limitación mutua de responsabilidad.\n\n` +
    `Quedamos atentos a una contrapropuesta razonable.\n\n` +
    `Saludos cordiales`;

  const writerOutput = {
    agent: "writer-ius-document",
    version: 1,
    channel: "email_negociacion",
    draft: draftEmail,
    disclaimer:
      "Borrador con fines de entrenamiento; no enviar sin revisión profesional.",
  };

  await supabase.from("mission_runs").update({
    writer_output: writerOutput as unknown as Record<string, unknown>,
    current_step: "training_review",
    status: "training_pending",
  }).eq("id", body.run_id);

  await supabase.from("mission_step_events").insert({
    run_id: body.run_id,
    step_key: "write",
    level: "info",
    message: "Borrador generado. Pendiente de revisión de entrenamiento (ADMIN).",
  });

  return jsonResponse({ ok: true, writer_output: writerOutput });
});
