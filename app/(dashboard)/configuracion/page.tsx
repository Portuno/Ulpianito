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

  if (!user) return null;

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
    </div>
  );
};

export default ConfiguracionPage;
