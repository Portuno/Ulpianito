import { redirect } from "next/navigation";
import { getServerProfile } from "@/lib/auth/profile";

export const requireAuthenticatedProfile = async () => {
  const data = await getServerProfile();
  if (!data.profile) {
    redirect("/login");
  }
  return data;
};

export const requireAdminProfile = async () => {
  const data = await requireAuthenticatedProfile();
  if (!data.isAdmin) {
    redirect("/dashboard");
  }
  return data;
};
