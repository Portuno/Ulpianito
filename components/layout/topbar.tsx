import { createClient } from "@/lib/supabase/server";
import { MobileSidebar } from "./sidebar";
import { UserNavDropdown } from "./user-nav";
import { TopbarContext } from "./topbar-context";
import { IusTopbarBalance } from "./ius-topbar-balance";

export const Topbar = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initials = "U";
  let nombre = "";
  let email = "";
  let iusBalance = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre, apellido, email")
      .eq("id", user.id)
      .single();

    if (profile) {
      const firstNameInitial = profile.nombre?.[0] ?? "";
      const lastNameInitial = profile.apellido?.[0] ?? "";

      initials = `${firstNameInitial}${lastNameInitial}`.toUpperCase() || "U";
      nombre = [profile.nombre, profile.apellido].filter(Boolean).join(" ");
      email = profile.email ?? "";
    }

    const { data: wallet } = await supabase
      .from("ius_wallets")
      .select("balance")
      .eq("profile_id", user.id)
      .single();

    iusBalance = wallet?.balance ?? 0;
  }

  return (
    <header className="flex h-16 items-center gap-3 border-b bg-background px-4 md:px-6">
      <MobileSidebar />
      <div className="flex-1">
        <TopbarContext />
      </div>
      <IusTopbarBalance balance={iusBalance} />
      <UserNavDropdown initials={initials} nombre={nombre} email={email} />
    </header>
  );
};
