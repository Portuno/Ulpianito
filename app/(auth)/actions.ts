"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthState = {
  error: string | null;
  success?: string | null;
};

export const login = async (
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> => {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá email y contraseña." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
};

export const register = async (
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> => {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const nombreDespacho = String(formData.get("nombreDespacho") ?? "").trim();

  if (!email || !password || !nombre || !apellido || !nombreDespacho) {
    return { error: "Completá todos los campos requeridos." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
        apellido,
        nombre_despacho: nombreDespacho,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (
    data.user &&
    data.user.identities &&
    data.user.identities.length === 0
  ) {
    return { error: "Este email ya está registrado" };
  }

  if (!data.session) {
    return {
      error: null,
      success: "Revisa tu email para confirmar tu cuenta",
    };
  }

  redirect("/dashboard");
};

export const logout = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
};
