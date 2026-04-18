import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ConfiguracionPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: despacho } = profile
    ? await supabase
        .from("despachos")
        .select("*")
        .eq("id", profile.despacho_id)
        .single()
    : { data: null };

  const [{ data: wallet }, { data: ledger }] = profile
    ? await Promise.all([
        supabase
          .from("ius_wallets")
          .select("balance")
          .eq("profile_id", profile.id)
          .single(),
        supabase
          .from("ius_ledger")
          .select("id, delta, reason, created_at")
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ])
    : [{ data: null }, { data: [] }];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil y tu despacho
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Tu información personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium">Nombre</p>
            <p className="text-sm text-muted-foreground">
              {profile?.nombre} {profile?.apellido}
            </p>
          </div>
          <Separator />
          <div className="grid gap-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <Separator />
          <div className="grid gap-1">
            <p className="text-sm font-medium">Rol</p>
            <p className="text-sm text-muted-foreground">{profile?.rol}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despacho</CardTitle>
          <CardDescription>Información de tu organización</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium">Nombre del despacho</p>
            <p className="text-sm text-muted-foreground">
              {despacho?.nombre ?? "—"}
            </p>
          </div>
          <Separator />
          <div className="grid gap-1">
            <p className="text-sm font-medium">Plan</p>
            <p className="text-sm text-muted-foreground">
              {despacho?.plan ?? "free"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Economía IUS</CardTitle>
          <CardDescription>Progreso gamificado personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium">Saldo actual</p>
            <p className="text-2xl font-bold tracking-tight">{wallet?.balance ?? 0} IUS</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Últimos movimientos</p>
            {(ledger ?? []).map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <span>{row.reason}</span>
                <span className="font-medium">+{row.delta}</span>
              </div>
            ))}
            {(ledger ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Sin movimientos todavía.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracionPage;
