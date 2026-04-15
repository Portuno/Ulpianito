import { createClient } from "@/lib/supabase/server";
import { MobileSidebar } from "./sidebar";
import { UserNavDropdown } from "./user-nav";

export const Topbar = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initials = "U";
  let nombre = "";
  let email = "";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre, apellido, email")
      .eq("id", user.id)
      .single();

    if (profile) {
      initials = `${profile.nombre[0]}${profile.apellido[0]}`.toUpperCase();
      nombre = `${profile.nombre} ${profile.apellido}`;
      email = profile.email;
    }
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <MobileSidebar />
      <div className="flex-1" />
      <UserNavDropdown initials={initials} nombre={nombre} email={email} />
    </header>
  );
};
