import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { IusWallet, Profile } from "@/lib/types/database";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FileText, FolderOpen, Clock, CalendarDays, Coins } from "lucide-react";

const DashboardPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("despacho_id, nombre")
    .eq("id", user.id)
    .single();

  const profile = (profileData as Pick<Profile, "despacho_id" | "nombre"> | null) ?? null;

  if (!profile) redirect("/configuracion");

  const oneWeekAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    { count: totalDocumentos },
    { count: expedientesActivos },
    { count: pendientesRevision },
    { count: documentosSemana },
    { data: recentDocs },
    { data: wallet },
    { count: iusThisWeek },
  ] = await Promise.all([
    supabase.from("documentos").select("*", { count: "planned", head: true }),
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
      .gte("created_at", oneWeekAgo),
    supabase
      .from("documentos")
      .select("id, nombre, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("ius_wallets")
      .select("balance")
      .eq("profile_id", user.id)
      .single(),
    supabase
      .from("ius_ledger")
      .select("*", { count: "planned", head: true })
      .eq("profile_id", user.id)
      .gt("delta", 0)
      .gte("created_at", oneWeekAgo),
  ]);

  const profileNombre = profile.nombre;
  const walletBalance = (wallet as Pick<IusWallet, "balance"> | null)?.balance ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido, {profileNombre}
        </h1>
        <p className="text-muted-foreground">
          Panel de eficiencia de tu despacho
        </p>
      </div>

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

      <div id="ius" className="grid gap-4 sm:grid-cols-2">
        <KPICard title="Saldo IUS" value={walletBalance} icon={Coins} />
        <KPICard
          title="Recompensas IUS (7 días)"
          value={iusThisWeek ?? 0}
          icon={Coins}
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
