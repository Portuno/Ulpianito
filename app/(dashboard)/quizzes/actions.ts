"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getServerProfile } from "@/lib/auth/profile";
import { invokeEdgeFunction } from "@/lib/ius/edge-invoke";
import { QUIZ_PASS_THRESHOLD_PCT } from "@/lib/ius/constants";
import type { Database } from "@/lib/types/database";

export type QuizActionState = { error: string | null; attemptId?: string };
type QuizInsert = Database["public"]["Tables"]["quizzes"]["Insert"];
type QuizAttemptInsert = Database["public"]["Tables"]["quiz_attempts"]["Insert"];
type QuizAttemptAnswerInsert = Database["public"]["Tables"]["quiz_attempt_answers"]["Insert"];
type QuizQuestionCheck = Pick<
  Database["public"]["Tables"]["quiz_questions"]["Row"],
  "id" | "correct_index"
>;
type ClaimQuizPassRewardArgs = Database["public"]["Functions"]["claim_quiz_pass_reward"]["Args"];

export const createQuizDraft = async (input: {
  title: string;
  sourceLabel?: string;
  expedienteId?: string | null;
  documentoId?: string | null;
}): Promise<{ error: string | null; quizId?: string }> => {
  const { userId, profile } = await getServerProfile();
  if (!userId || !profile) {
    return { error: "No autenticado" };
  }

  const supabase = await createClient();
  const quizInsert: QuizInsert = {
      despacho_id: profile.despacho_id,
      title: input.title,
      source_label: input.sourceLabel ?? null,
      expediente_id: input.expedienteId ?? null,
      documento_id: input.documentoId ?? null,
      created_by: userId,
      status: "draft",
    };
  const { data, error } = await supabase
    .from("quizzes")
    .insert(quizInsert)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/quizzes");
  return { error: null, quizId: data.id };
};

export const generateQuizQuestions = async (
  quizId: string
): Promise<{ error: string | null }> => {
  const { userId } = await getServerProfile();
  if (!userId) {
    return { error: "No autenticado" };
  }

  try {
    await invokeEdgeFunction("ius-generate-quiz", { quiz_id: quizId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al generar quiz";
    return { error: msg };
  }

  revalidatePath("/quizzes");
  revalidatePath(`/quizzes/${quizId}`);
  return { error: null };
};

export const submitQuizAttempt = async (
  quizId: string,
  answers: { questionId: string; selectedIndex: number }[]
): Promise<QuizActionState> => {
  const { userId } = await getServerProfile();
  if (!userId) {
    return { error: "No autenticado" };
  }

  if (!quizId || answers.length === 0) {
    return { error: "Intento inválido: faltan respuestas." };
  }

  const supabase = await createClient();

  const { data: questionsData, error: qErr } = await supabase
    .from("quiz_questions")
    .select("id, correct_index")
    .eq("quiz_id", quizId);
  const questions = (questionsData as QuizQuestionCheck[] | null) ?? [];

  if (qErr || !questions?.length) {
    return { error: qErr?.message ?? "Sin preguntas" };
  }

  const questionIds = new Set(questions.map((q) => q.id));
  for (const answer of answers) {
    if (!questionIds.has(answer.questionId)) {
      return { error: "Se detectaron respuestas para preguntas inválidas." };
    }
    if (!Number.isInteger(answer.selectedIndex) || answer.selectedIndex < 0) {
      return { error: "Se detectaron opciones inválidas en las respuestas." };
    }
  }

  let correct = 0;
  for (const q of questions) {
    const ans = answers.find((a) => a.questionId === q.id);
    if (ans && ans.selectedIndex === q.correct_index) {
      correct += 1;
    }
  }

  const scorePct = Math.round((correct / questions.length) * 10000) / 100;
  const passed = scorePct >= QUIZ_PASS_THRESHOLD_PCT;

  const attemptInsert: QuizAttemptInsert = {
      quiz_id: quizId,
      profile_id: userId,
      score_pct: scorePct,
      passed,
      completed_at: new Date().toISOString(),
    };
  const { data: attempt, error: aErr } = await supabase
    .from("quiz_attempts")
    .insert(attemptInsert)
    .select("id")
    .single();

  if (aErr || !attempt) {
    return { error: aErr?.message ?? "Error al guardar intento" };
  }

  const rows: QuizAttemptAnswerInsert[] = answers.map((a) => ({
    attempt_id: attempt.id,
    question_id: a.questionId,
    selected_index: a.selectedIndex,
  }));

  const { error: ansErr } = await supabase
    .from("quiz_attempt_answers")
    .insert(rows);
  if (ansErr) {
    return { error: ansErr.message };
  }

  if (passed) {
    const claimPayload: ClaimQuizPassRewardArgs = {
      p_attempt_id: attempt.id,
    };
    const { error: claimErr } = await supabase.rpc(
      "claim_quiz_pass_reward",
      claimPayload
    );
    if (claimErr) {
      return { error: claimErr.message };
    }
  }

  revalidatePath("/quizzes");
  revalidatePath(`/quizzes/${quizId}`);
  revalidatePath("/dashboard");
  return { error: null, attemptId: attempt.id };
};
