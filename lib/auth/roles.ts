import type { AppRole } from "@/lib/types/database";

export const normalizeRole = (role: string | null | undefined): AppRole => {
  const r = (role ?? "jurista").toLowerCase().trim();
  if (r === "admin") {
    return "admin";
  }
  return "jurista";
};

export const isAdminRole = (role: string | null | undefined): boolean =>
  normalizeRole(role) === "admin";
