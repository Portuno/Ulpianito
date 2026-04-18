import { createClient } from "@/lib/supabase/server";
import { MobileSidebar } from "./sidebar";
import { UserNavDropdown } from "./user-nav";
import { Coins } from "lucide-react";
import { TopbarContext } from "./topbar-context";

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
      <div className="hidden items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-sm font-semibold md:flex">
        <Coins className="h-4 w-4 text-amber-500" aria-hidden="true" />
        <span>{iusBalance} IUS</span>
      </div>
      <UserNavDropdown initials={initials} nombre={nombre} email={email} />
    </header>
  );
};
