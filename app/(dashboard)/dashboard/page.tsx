import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FileText, FolderOpen, Clock, CalendarDays } from "lucide-react";

const DashboardPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const oneWeekAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    { count: totalDocumentos },
    { count: expedientesActivos },
    { count: pendientesRevision },
    { count: documentosSemana },
    { data: recentDocs },
  ] = await Promise.all([
    supabase
      .from("documentos")
      .select("*", { count: "planned", head: true })
      .eq("uploaded_by", user.id),
    supabase
      .from("expedientes")
      .select("*", { count: "planned", head: true })
      .eq("estado", "activo"),
    supabase
      .from("facturas")
      .select("*", { count: "planned", head: true })
      .eq("estado_validacion", "pendiente"),
    supabase
      .from("documentos")
      .select("*", { count: "planned", head: true })
      .eq("uploaded_by", user.id)
      .gte("created_at", oneWeekAgo),
    supabase
      .from("documentos")
      .select("id, nombre, created_at")
      .eq("uploaded_by", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Documentos procesados"
          value={totalDocumentos ?? 0}
          icon={FileText}
        />
        <KPICard
          title="Expedientes activos"
          value={expedientesActivos ?? 0}
          icon={FolderOpen}
        />
        <KPICard
          title="Pendientes de revisión"
          value={pendientesRevision ?? 0}
          icon={Clock}
        />
        <KPICard
          title="Docs. esta semana"
          value={documentosSemana ?? 0}
          icon={CalendarDays}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity documents={recentDocs ?? []} />
        <QuickActions />
      </div>
    </div>
  );
};

export default DashboardPage;
