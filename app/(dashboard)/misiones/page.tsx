import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Mission, MissionRun } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createMissionRun } from "@/app/(dashboard)/misiones/actions";
import { CheckCircle2, Play } from "lucide-react";

type MissionRunWithMission = MissionRun & {
  missions: { title?: string | null; slug?: string | null } | null;
};

const MisionesPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: missionsData } = await supabase
    .from("missions")
    .select("*")
    .order("created_at", { ascending: false });
  const missions = (missionsData as Mission[] | null) ?? [];

  const { data: runsData } = await supabase
    .from("mission_runs")
    .select("*, missions(title, slug)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const runs = (runsData as MissionRunWithMission[] | null) ?? [];
  const startedRuns = runs.length;
  const hitlRuns = runs.filter((run) => run.current_step === "hitl_review").length;
  const completedRuns = runs.filter((run) => run.status === "completed").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Misiones Ius</h1>
        <p className="text-muted-foreground">
          Progresión tipo 4X: extracción, HITL, planificación y revisión.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progresión de entrenamiento</CardTitle>
          <CardDescription>
            Ruta sugerida: extracción, HITL, planificación y revisión final.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Misiones iniciadas</p>
            <p className="text-2xl font-semibold">{startedRuns}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">En paso HITL</p>
            <p className="text-2xl font-semibold">{hitlRuns}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Completadas</p>
            <p className="text-2xl font-semibold">{completedRuns}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Misiones disponibles</CardTitle>
          <CardDescription>
            Iniciá una ejecución. Las recompensas IUS se acreditan por paso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.title}</TableCell>
                  <TableCell>{m.mission_type}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form
                      action={async () => {
                        "use server";
                        const res = await createMissionRun(m.id);
                        if (res.runId) {
                          redirect(`/misiones/runs/${res.runId}`);
                        }
                      }}
                    >
                      <Button type="submit" size="sm">
                        <Play className="mr-1 h-4 w-4" aria-hidden />
                        Iniciar
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {missions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay misiones activas. Volvé a un expediente y generá contexto para habilitar nuevas prácticas.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis ejecuciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Misión</TableHead>
                <TableHead>Paso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Abrir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((r) => {
                const title =
                  (r.missions as { title?: string } | null)?.title ?? "—";
                return (
                  <TableRow key={r.id}>
                    <TableCell>{title}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.current_step}
                    </TableCell>
                    <TableCell>
                      <Badge>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/misiones/runs/${r.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {runs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Iniciá tu primera misión para desbloquear el paso de revisión HITL y sumar IUS.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Siguiente paso recomendado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            Si ya completaste extracción, abrí tu ejecución y cerrá la revisión HITL.
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            Después, consolidá el aprendizaje resolviendo un quiz temático.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/quizzes">Continuar en Quizzes IA</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MisionesPage;
