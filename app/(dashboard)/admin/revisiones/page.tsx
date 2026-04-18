import { createClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const AdminRevisionesPage = async () => {
  const { profile } = await requireAdminProfile();

  const supabase = await createClient();
  const { data: runs } = await supabase
    .from("mission_runs")
    .select("id, status, current_step, created_at, missions(title), profiles(nombre, apellido)")
    .eq("despacho_id", profile.despacho_id)
    .eq("status", "training_pending")
    .order("created_at", { ascending: false });

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
