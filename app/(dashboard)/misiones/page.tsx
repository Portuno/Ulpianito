import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
import { Play } from "lucide-react";

const MisionesPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: missions } = await supabase
    .from("missions")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: runs } = await supabase
    .from("mission_runs")
    .select("*, missions(title, slug)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

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
              {(missions ?? []).map((m) => (
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
          {(missions ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay misiones. Un administrador puede crear plantillas.
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
              {(runs ?? []).map((r) => {
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
          {(runs ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              Todavía no iniciaste ninguna misión.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MisionesPage;
