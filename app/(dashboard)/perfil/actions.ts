"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PerfilState = {
  error: string | null;
  success?: string | null;
};

export const updatePerfil = async (
  _prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const nombreDespacho = String(formData.get("nombre_despacho") ?? "").trim();

  if (!nombre || !apellido) {
    return { error: "Nombre y apellido son obligatorios." };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("despacho_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profileData) {
    return { error: "No se pudo cargar tu perfil." };
  }

  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({
      nombre,
      apellido,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateProfileError) {
    return { error: updateProfileError.message };
  }

  if (nombreDespacho) {
    const { error: updateDespachoError } = await supabase
      .from("despachos")
      .update({
        nombre: nombreDespacho,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileData.despacho_id);

    if (updateDespachoError) {
      return { error: updateDespachoError.message };
    }
  }

  revalidatePath("/perfil");
  revalidatePath("/dashboard");

  return { error: null, success: "Perfil actualizado correctamente." };
};
