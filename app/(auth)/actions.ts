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

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const nombreDespacho = formData.get("nombreDespacho") as string;

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
