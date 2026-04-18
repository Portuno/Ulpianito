import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { isAdminRole } from "@/lib/auth/roles";

export const getServerProfile = async (): Promise<{
  userId: string;
  profile: Profile | null;
  isAdmin: boolean;
}> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: "", profile: null, isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    profile,
    isAdmin: isAdminRole(profile?.rol),
  };
};
