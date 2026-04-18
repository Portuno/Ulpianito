import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createQuizDraft, generateQuizQuestions } from "@/app/(dashboard)/quizzes/actions";

const QuizzesPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

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
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizzesPage;
