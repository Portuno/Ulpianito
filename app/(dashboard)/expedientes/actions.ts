"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/types/database";

export type ExpedienteState = {
  error: string | null;
};

type ProfileMin = Pick<Database["public"]["Tables"]["profiles"]["Row"], "despacho_id">;
type ExpedienteInsert = Database["public"]["Tables"]["expedientes"]["Insert"];
type ExpedienteUpdate = Database["public"]["Tables"]["expedientes"]["Update"];
type SujetoInsert = Database["public"]["Tables"]["sujetos"]["Insert"];
type DocumentoInsert = Database["public"]["Tables"]["documentos"]["Insert"];

export const createExpediente = async (
  _prevState: ExpedienteState,
  formData: FormData
): Promise<ExpedienteState> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profileData } = await (supabase.from("profiles") as any)
    .select("despacho_id")
    .eq("id", user.id)
    .single();

  const profile = (profileData as ProfileMin | null) ?? null;

  if (!profile) return { error: "Perfil no encontrado" };

  const titulo = formData.get("titulo") as string;
  const numero_expediente = formData.get("numero_expediente") as string;
  const tipo = formData.get("tipo") as string;
  const descripcion = (formData.get("descripcion") as string) || null;
  const expedienteId = crypto.randomUUID();

  const expedienteInsert: ExpedienteInsert = {
    id: expedienteId,
    despacho_id: profile.despacho_id,
    created_by: user.id,
    titulo,
    numero_expediente,
    tipo,
    descripcion,
  };

  const { error } = await (supabase.from("expedientes") as any).insert(expedienteInsert);

  if (error) {
    return { error: error.message };
  }

  redirect(`/expedientes/${expedienteId}`);
};

export const updateExpedienteNotes = async (
  expedienteId: string,
  notas: string
): Promise<{ error: string | null }> => {
  const supabase = await createClient();

  const expedientePatch: ExpedienteUpdate = { notas };
  const { error } = await (supabase.from("expedientes") as any)
    .update(expedientePatch)
    .eq("id", expedienteId);

  if (error) return { error: error.message };

  revalidatePath(`/expedientes/${expedienteId}`);
  return { error: null };
};

export const createSujeto = async (
  _prevState: ExpedienteState,
  formData: FormData
): Promise<ExpedienteState> => {
  const supabase = await createClient();

  const expediente_id = formData.get("expediente_id") as string;
  const nombre = formData.get("nombre") as string;
  const rol_procesal = formData.get("rol_procesal") as string;
  const dni = (formData.get("dni") as string) || null;
  const contacto = (formData.get("contacto") as string) || null;

  const sujetoInsert: SujetoInsert = { expediente_id, nombre, rol_procesal, dni, contacto };
  const { error } = await (supabase.from("sujetos") as any).insert(sujetoInsert);

  if (error) return { error: error.message };

  revalidatePath(`/expedientes/${expediente_id}`);
  return { error: null };
};

export const deleteSujeto = async (
  sujetoId: string,
  expedienteId: string
) => {
  const supabase = await createClient();
  await supabase.from("sujetos").delete().eq("id", sujetoId);
  revalidatePath(`/expedientes/${expedienteId}`);
};

export const uploadDocument = async (
  formData: FormData
): Promise<{ error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profileData } = await (supabase.from("profiles") as any)
    .select("despacho_id")
    .eq("id", user.id)
    .single();

  const profile = (profileData as ProfileMin | null) ?? null;

  if (!profile) return { error: "Perfil no encontrado" };

  const file = formData.get("file") as File;
  const expedienteId = formData.get("expediente_id") as string;

  if (!file || file.size === 0) return { error: "No se seleccionó un archivo" };
  if (file.size > 10 * 1024 * 1024)
    return { error: "El archivo excede el límite de 10MB" };

  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `${profile.despacho_id}/${expedienteId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(storagePath, file);

  if (uploadError) return { error: uploadError.message };

  const documentoInsert: DocumentoInsert = {
    expediente_id: expedienteId,
    uploaded_by: user.id,
    nombre: file.name,
    storage_path: storagePath,
    mime_type: file.type || "application/octet-stream",
    size_bytes: file.size,
  };
  const { error: dbError } = await (supabase.from("documentos") as any).insert(
    documentoInsert
  );

  if (dbError) return { error: dbError.message };

  revalidatePath(`/expedientes/${expedienteId}`);
  return { error: null };
};

export const deleteDocument = async (
  documentId: string,
  storagePath: string,
  expedienteId: string
) => {
  const supabase = await createClient();

  await supabase.storage.from("documentos").remove([storagePath]);
  await supabase.from("documentos").delete().eq("id", documentId);

  revalidatePath(`/expedientes/${expedienteId}`);
};
