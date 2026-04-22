import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";

const PerfilPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, apellido, email, despacho_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/dashboard");
  }

  const { data: despacho } = await supabase
    .from("despachos")
    .select("nombre")
    .eq("id", profile.despacho_id)
    .single();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mi perfil</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona tus datos personales y la información base de tu despacho.
        </p>
      </div>

      <ProfileForm
        nombre={profile.nombre ?? ""}
        apellido={profile.apellido ?? ""}
        email={profile.email ?? user.email ?? ""}
        despachoNombre={despacho?.nombre ?? ""}
      />
    </div>
  );
};

export default PerfilPage;
