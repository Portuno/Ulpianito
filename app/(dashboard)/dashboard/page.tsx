import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AlertTriangle, CalendarDays, Clock, FileText, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    { data: recentCases },
    { data: dueEvents },
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
      .from("expedientes")
      .select("id, titulo, estado, updated_at, created_by")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("eventos")
      .select("id, expediente_id, fecha_vencimiento, completado")
      .eq("completado", false)
      .not("fecha_vencimiento", "is", null),
  ]);

  const now = new Date();
  const endToday = new Date();
  endToday.setHours(23, 59, 59, 999);
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);

  const dueTodayCount = (dueEvents ?? []).filter((event) => {
    if (!event.fecha_vencimiento) return false;
    const dueDate = new Date(event.fecha_vencimiento);
    return dueDate >= startToday && dueDate <= endToday;
  }).length;

  const overdueCount = (dueEvents ?? []).filter((event) => {
    if (!event.fecha_vencimiento) return false;
    return new Date(event.fecha_vencimiento) < now;
  }).length;

  const casesWithDueDate = (recentCases ?? []).map((expediente) => {
    const dueDateCandidate = (dueEvents ?? [])
      .filter(
        (event) =>
          event.fecha_vencimiento && event.expediente_id === expediente.id
      )
      .sort((a, b) =>
        new Date(a.fecha_vencimiento ?? "").getTime() -
        new Date(b.fecha_vencimiento ?? "").getTime()
      )[0];

    return {
      ...expediente,
      owner: expediente.created_by === user.id ? "Tú" : "Equipo",
      dueDate: dueDateCandidate?.fecha_vencimiento ?? null,
    };
  });

  const contextualActions = [
    {
      href: "/expedientes/nuevo",
      label: "Crear o abrir expediente prioritario",
      detail:
        expedientesActivos && expedientesActivos > 0
          ? "Suma contexto nuevo o actualiza uno existente antes de iniciar otro flujo."
          : "Arrancá tu primer caso para activar el resto de módulos.",
      icon: "create" as const,
      priority: "Alta" as const,
    },
    {
      href: "/validacion",
      label: "Tomar pendientes de revisión HITL",
      detail: `Tenés ${pendientesRevision ?? 0} pendientes de revisión para resolver.`,
      icon: "review" as const,
      priority: "Alta" as const,
    },
    {
      href: "/expedientes",
      label: "Revisar expedientes activos",
      detail: `Actualmente hay ${expedientesActivos ?? 0} expedientes activos en operación.`,
      icon: "list" as const,
      priority: "Media" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">Alertas operativas del día</p>
              <p className="text-muted-foreground">
                {dueTodayCount} vencen hoy y {overdueCount} están fuera de plazo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <RecentActivity cases={casesWithDueDate} />
        <QuickActions actions={contextualActions} />
      </div>
    </div>
  );
};

export default DashboardPage;
