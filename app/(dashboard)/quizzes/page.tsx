import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createQuizDraft, generateQuizQuestions } from "@/app/(dashboard)/quizzes/actions";
import { CheckCircle2, BrainCircuit } from "lucide-react";

const QuizzesPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("id, passed, completed_at")
    .eq("profile_id", user.id)
    .not("completed_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const completedAttempts = attempts?.length ?? 0;
  const passedAttempts = attempts?.filter((attempt) => attempt.passed).length ?? 0;
  const passRate = completedAttempts > 0 ? Math.round((passedAttempts / completedAttempts) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quizzes IA</h1>
        <p className="text-muted-foreground">
          Generá examencitos dinámicos desde documentos y ganá IUS al aprobar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BrainCircuit className="h-4 w-4 text-primary" />
            Progreso en evaluación
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Intentos completados</p>
            <p className="text-2xl font-semibold">{completedAttempts}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Intentos aprobados</p>
            <p className="text-2xl font-semibold">{passedAttempts}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Pass rate</p>
            <p className="text-2xl font-semibold">{passRate}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crear quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-2 sm:grid-cols-3"
            action={async (formData) => {
              "use server";
              const title = String(formData.get("title") ?? "");
              const sourceLabel = String(formData.get("sourceLabel") ?? "");
              const created = await createQuizDraft({ title, sourceLabel });
              if (!created.quizId) return;
              await generateQuizQuestions(created.quizId);
              redirect(`/quizzes/${created.quizId}`);
            }}
          >
            <Input name="title" placeholder="Quiz IA Act" required />
            <Input name="sourceLabel" placeholder="Fuente: normativa IA Act" />
            <Button type="submit">Crear y generar</Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Recomendación: usa un <span className="font-medium text-foreground">sourceLabel</span> claro para mejorar la calidad de preguntas.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(quizzes ?? []).map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="font-medium">{q.title}</p>
                <p className="text-xs text-muted-foreground">{q.status}</p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/quizzes/${q.id}`}>Resolver</Link>
              </Button>
            </div>
          ))}
          {(quizzes ?? []).length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Todavía no hay quizzes para practicar. Crea el primero desde una misión que ya revisaste en HITL.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Siguiente paso para subir nivel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            Si aprobás el quiz, validá una misión y reclamá tu avance en IUS.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/ius">Ver progreso IUS</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizzesPage;
