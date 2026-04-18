import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createUserSupabase } from "../_shared/supabase-user.ts";

type Body = {
  quiz_id: string;
  source_text?: string;
};

const buildFallbackQuestions = (label: string) => [
  {
    orden: 1,
    question: `Sobre "${label}": ¿cuál es el objetivo principal del documento fuente?`,
    options: [
      "Establecer un marco regulatorio o contractual claro",
      "Eliminar obligaciones para las partes",
      "Sustituir la normativa penal",
      "Declarar nulidad automática de contratos",
    ],
    correct_index: 0,
    explanation:
      "Los textos normativos o contractuales suelen fijar reglas y obligaciones, no anular sistemas enteros.",
  },
  {
    orden: 2,
    question:
      "En materia de datos personales, ¿qué principio es central en el marco europeo (RGPD)?",
    options: [
      "Licitud, lealtad y transparencia",
      "Ignorancia de la finalidad",
      "Tratamiento ilimitado sin base legal",
      "Eliminación inmediata sin excepciones",
    ],
    correct_index: 0,
    explanation:
      "El RGPD enfatiza bases legales, transparencia y limitación de finalidad.",
  },
  {
    orden: 3,
    question:
      "Si una licencia es 'exclusiva e irrevocable' con datos sensibles, ¿qué riesgo suele evaluarse primero?",
    options: [
      "Desalineación entre alcance del derecho y contraprestación / riesgo residual",
      "Que el documento carezca de partes",
      "Que no existan obligaciones procesales",
      "Que la moneda local sea irrelevante",
    ],
    correct_index: 0,
    explanation:
      "La coherencia económica y el riesgo sobre activos críticos (p. ej. PII) suelen ser foco de revisión.",
  },
];

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

  if (!body.quiz_id) {
    return jsonResponse({ error: "quiz_id requerido" }, 400);
  }

  const supabase = createUserSupabase(req);

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: "No autenticado" }, 401);
  }

  const { data: quiz, error: quizErr } = await supabase
    .from("quizzes")
    .select("id, title, source_label, created_by, despacho_id")
    .eq("id", body.quiz_id)
    .single();

  if (quizErr || !quiz) {
    return jsonResponse({ error: "Quiz no encontrado" }, 404);
  }
  if (quiz.created_by !== user.id) {
    return jsonResponse({ error: "Solo el creador puede generar preguntas" }, 403);
  }

  const label = quiz.source_label ?? quiz.title;
  const questions = buildFallbackQuestions(label);

  await supabase.from("quiz_questions").delete().eq("quiz_id", body.quiz_id);

  const rows = questions.map((q) => ({
    quiz_id: body.quiz_id,
    orden: q.orden,
    question: q.question,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation,
  }));

  const { error: insErr } = await supabase.from("quiz_questions").insert(rows);
  if (insErr) {
    return jsonResponse({ error: insErr.message }, 500);
  }

  await supabase.from("quizzes").update({
    status: "ready",
  }).eq("id", body.quiz_id);

  return jsonResponse({ ok: true, questions_count: questions.length });
});
