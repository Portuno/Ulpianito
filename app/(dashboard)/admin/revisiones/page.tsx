import { createClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type MissionRunReview = {
  id: string;
  status: string;
  current_step: number;
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
    .select("id, status, current_step, created_at, missions(title), profiles(nombre, apellido)")
    .eq("despacho_id", profile.despacho_id)
    .eq("status", "training_pending")
    .order("created_at", { ascending: false });
  const runs: MissionRunReview[] = (runsData ?? []) as MissionRunReview[];

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
