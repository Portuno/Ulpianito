import { createClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type MissionRunReview = {
  id: string;
  status: string;
  current_step: string;
  missions: { title?: string } | null;
  profiles: { nombre?: string | null; apellido?: string | null } | null;
};

const AdminRevisionesPage = async () => {
  const { profile } = await requireAdminProfile();

  if (!profile?.despacho_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Revisiones de entrenamiento</h1>
        <Card>
          <CardHeader>
            <CardTitle>Pendientes (ADMIN)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No se encontro un despacho asociado a tu perfil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: runsData } = await supabase
    .from("mission_runs")
    .select("id, status, current_step, mission_id, profile_id, created_at")
    .eq("despacho_id", profile.despacho_id)
    .eq("status", "training_pending")
    .order("created_at", { ascending: false });

  const missionIds = Array.from(new Set((runsData ?? []).map((run) => run.mission_id)));
  const profileIds = Array.from(new Set((runsData ?? []).map((run) => run.profile_id)));

  const { data: missionsData } = await supabase
    .from("missions")
    .select("id, title")
    .in("id", missionIds);

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, nombre, apellido")
    .in("id", profileIds);

  const missionsById = new Map((missionsData ?? []).map((mission) => [mission.id, mission]));
  const profilesById = new Map((profilesData ?? []).map((prof) => [prof.id, prof]));

  const runs: MissionRunReview[] = (runsData ?? []).map((run) => ({
    id: run.id,
    status: run.status,
    current_step: run.current_step,
    missions: (() => {
      const mission = missionsById.get(run.mission_id);
      if (!mission) return null;
      return { title: mission.title };
    })(),
    profiles: (() => {
      const prof = profilesById.get(run.profile_id);
      if (!prof) return null;
      return { nombre: prof.nombre, apellido: prof.apellido };
    })(),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Revisiones de entrenamiento</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pendientes (ADMIN)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(runs ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">
                  {(r.missions as { title?: string } | null)?.title ?? "Misión"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Paso: {r.current_step} · Estado: {r.status}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/misiones/runs/${r.id}`}>Revisar</Link>
              </Button>
            </div>
          ))}
          {(runs ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No hay revisiones pendientes.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRevisionesPage;
