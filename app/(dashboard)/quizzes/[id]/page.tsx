import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizPlayer } from "@/components/quizzes/quiz-player";

type Props = {
  params: Promise<{ id: string }>;
};

const QuizDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).single();
  if (!quiz) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", id)
    .order("orden", { ascending: true });

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("id, score_pct, passed, created_at")
    .eq("quiz_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{quiz.title}</h1>
        <p className="text-muted-foreground">{quiz.source_label ?? "Sin fuente"}</p>
      </div>
      <QuizPlayer quizId={id} questions={questions ?? []} />
      <Card>
        <CardHeader>
          <CardTitle>Intentos recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(attempts ?? []).map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-md border p-2">
              <span>{new Date(a.created_at).toLocaleString()}</span>
              <span>{a.score_pct ?? 0}% · {a.passed ? "Aprobado" : "No aprobado"}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizDetailPage;
