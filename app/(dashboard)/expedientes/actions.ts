"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Database, DocumentExtractionReport } from "@/lib/types/database";
import { invokeEdgeFunction } from "@/lib/ius/edge-invoke";
import { getServerProfile } from "@/lib/auth/profile";

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

  const { data: profileData } = await supabase
    .from("profiles")
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

  const { error } = await supabase.from("expedientes").insert(expedienteInsert);

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
  const { error } = await supabase
    .from("expedientes")
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
  const { error } = await supabase.from("sujetos").insert(sujetoInsert);

  if (error) return { error: error.message };

  revalidatePath(`/expedientes/${expediente_id}`);
  return { error: null };
};

export const deleteSujeto = async (
  sujetoId: string,
  expedienteId: string
) => {
  const supabase = await createClient();
  const { error } = await supabase.from("sujetos").delete().eq("id", sujetoId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/expedientes/${expedienteId}`);
  return { error: null };
};

export const uploadDocument = async (
  formData: FormData
): Promise<{ error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profileData } = await supabase
    .from("profiles")
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
  const { error: dbError } = await supabase
    .from("documentos")
    .insert(documentoInsert);

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

  const { error: storageError } = await supabase.storage
    .from("documentos")
    .remove([storagePath]);
  if (storageError) {
    return { error: storageError.message };
  }
  const { error: dbError } = await supabase
    .from("documentos")
    .delete()
    .eq("id", documentId);
  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath(`/expedientes/${expedienteId}`);
  return { error: null };
};

type ActivosInsert = Database["public"]["Tables"]["activos"]["Insert"];

const revalidateDocumentPaths = (
  expedienteId: string,
  documentoId: string
) => {
  revalidatePath(`/expedientes/${expedienteId}`);
  revalidatePath(`/expedientes/${expedienteId}/documentos/${documentoId}`);
};

export const runDocumentExtraction = async (
  documentoId: string,
  expedienteId: string
): Promise<{ error: string | null }> => {
  const { userId } = await getServerProfile();
  if (!userId) return { error: "No autenticado" };

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documentos")
    .select("id")
    .eq("id", documentoId)
    .eq("expediente_id", expedienteId)
    .single();

  if (!doc) return { error: "Documento no encontrado" };

  try {
    await invokeEdgeFunction("document-extract-gemini", {
      documento_id: documentoId,
    });
    revalidateDocumentPaths(expedienteId, documentoId);
    return { error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al extraer";
    revalidateDocumentPaths(expedienteId, documentoId);
    return { error: msg };
  }
};

export const saveDocumentExtractionReport = async (
  documentoId: string,
  expedienteId: string,
  report: DocumentExtractionReport
): Promise<{ error: string | null }> => {
  const { userId } = await getServerProfile();
  if (!userId) return { error: "No autenticado" };

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documentos")
    .select("id")
    .eq("id", documentoId)
    .eq("expediente_id", expedienteId)
    .single();

  if (!doc) return { error: "Documento no encontrado" };

  const { error } = await supabase
    .from("documentos")
    .update({ extraction_report: report })
    .eq("id", documentoId);

  if (error) return { error: error.message };

  revalidateDocumentPaths(expedienteId, documentoId);
  return { error: null };
};

export const validateDocumentExtraction = async (
  documentoId: string,
  expedienteId: string
): Promise<{ error: string | null }> => {
  const { userId } = await getServerProfile();
  if (!userId) return { error: "No autenticado" };

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documentos")
    .select("id, extraction_status")
    .eq("id", documentoId)
    .eq("expediente_id", expedienteId)
    .single();

  if (!doc) return { error: "Documento no encontrado" };
  if (doc.extraction_status !== "done") {
    return { error: "Solo podés validar después de una extracción completada" };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("documentos")
    .update({
      validado_por: userId,
      validado_at: now,
      origen: "ia",
    })
    .eq("id", documentoId);

  if (error) return { error: error.message };

  revalidateDocumentPaths(expedienteId, documentoId);
  return { error: null };
};

const parseImporteNumber = (raw: string | undefined): number | null => {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim().replace(/\s/g, "");
  if (!t) return null;
  const comma = t.lastIndexOf(",");
  const dot = t.lastIndexOf(".");
  let normalized: string;
  if (comma > dot) {
    normalized = t.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = t.replace(/,/g, "");
  }
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
};

const normalizeTextKey = (value: string | null | undefined): string =>
  (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const buildSujetoDedupeKey = (
  nombre: string,
  rolProcesal: string,
  dni?: string | null
): string => {
  return [
    normalizeTextKey(nombre),
    normalizeTextKey(rolProcesal),
    normalizeTextKey(dni ?? null),
  ].join("|");
};

const buildActivoDedupeKey = (
  descripcion: string,
  moneda: string,
  valor?: number | null
): string => {
  const valueToken = Number.isFinite(valor ?? NaN)
    ? (valor as number).toFixed(2)
    : "null";
  return [
    normalizeTextKey(descripcion),
    normalizeTextKey(moneda),
    valueToken,
  ].join("|");
};

export const applyExtractionToExpediente = async (
  documentoId: string,
  expedienteId: string
): Promise<{ error: string | null; created?: { sujetos: number; activos: number } }> => {
  const { userId } = await getServerProfile();
  if (!userId) return { error: "No autenticado" };

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documentos")
    .select("id, extraction_report, extraction_status, validado_at")
    .eq("id", documentoId)
    .eq("expediente_id", expedienteId)
    .single();

  if (!doc) return { error: "Documento no encontrado" };
  if (!doc.extraction_report || (doc.extraction_status ?? "") !== "done") {
    return { error: "No hay un reporte extraído para aplicar" };
  }
  if (!doc.validado_at) {
    return { error: "Validá primero los datos extraídos" };
  }

  const report = doc.extraction_report as DocumentExtractionReport;
  const partes = report.partes_y_proceso;
  let sujetosCount = 0;
  let activosCount = 0;
  const { data: sujetosData } = await supabase
    .from("sujetos")
    .select("nombre, rol_procesal, dni")
    .eq("expediente_id", expedienteId);
  const existingSujetoKeys = new Set(
    (sujetosData ?? []).map((s) =>
      buildSujetoDedupeKey(s.nombre, s.rol_procesal, s.dni)
    )
  );
  const seenSujetoKeys = new Set<string>();

  const { data: activosData } = await supabase
    .from("activos")
    .select("descripcion, moneda, valor_estimado")
    .eq("expediente_id", expedienteId);
  const existingActivoKeys = new Set(
    (activosData ?? []).map((a) =>
      buildActivoDedupeKey(
        a.descripcion,
        a.moneda ?? "ARS",
        a.valor_estimado == null ? null : Number(a.valor_estimado)
      )
    )
  );
  const seenActivoKeys = new Set<string>();

  if (partes?.personas_juridicas) {
    for (const pj of partes.personas_juridicas) {
      const nombre = pj.nombre?.trim();
      if (!nombre) continue;
      const ins: Database["public"]["Tables"]["sujetos"]["Insert"] = {
        expediente_id: expedienteId,
        nombre,
        rol_procesal: pj.rol?.trim() || "Parte",
        tipo_sujeto: "parte",
        notas: pj.identificadores?.trim()
          ? `Persona jurídica · ${pj.identificadores.trim()}`
          : null,
        origen: "ia",
        validado_por: userId,
        validado_at: new Date().toISOString(),
      };
      const dedupeKey = buildSujetoDedupeKey(ins.nombre, ins.rol_procesal, ins.dni);
      if (existingSujetoKeys.has(dedupeKey) || seenSujetoKeys.has(dedupeKey)) continue;
      const { error } = await supabase.from("sujetos").insert(ins);
      if (error) return { error: error.message };
      seenSujetoKeys.add(dedupeKey);
      sujetosCount += 1;
    }
  }

  if (partes?.personas_fisicas) {
    for (const pf of partes.personas_fisicas) {
      const nombre = pf.nombre?.trim();
      if (!nombre) continue;
      const ins: Database["public"]["Tables"]["sujetos"]["Insert"] = {
        expediente_id: expedienteId,
        nombre,
        rol_procesal: pf.rol?.trim() || "Parte",
        tipo_sujeto: "parte",
        dni: pf.documento?.trim() || null,
        origen: "ia",
        validado_por: userId,
        validado_at: new Date().toISOString(),
      };
      const dedupeKey = buildSujetoDedupeKey(ins.nombre, ins.rol_procesal, ins.dni);
      if (existingSujetoKeys.has(dedupeKey) || seenSujetoKeys.has(dedupeKey)) continue;
      const { error } = await supabase.from("sujetos").insert(ins);
      if (error) return { error: error.message };
      seenSujetoKeys.add(dedupeKey);
      sujetosCount += 1;
    }
  }

  const pat = report.aspecto_patrimonial;
  if (pat?.importes) {
    for (const row of pat.importes) {
      const concepto = row.concepto?.trim();
      if (!concepto && !row.importe?.trim()) continue;
      const valor = parseImporteNumber(row.importe);
      const descripcion =
        concepto ||
        (row.importe ? `Importe ${row.importe}` : "Partida patrimonial");
      const activo: ActivosInsert = {
        expediente_id: expedienteId,
        created_by: userId,
        tipo: "activo",
        categoria: "otro",
        descripcion,
        valor_estimado: valor,
        moneda: row.moneda?.trim() || "ARS",
        notas: `Desde documento ${documentoId}`,
        origen: "ia",
        validado_por: userId,
        validado_at: new Date().toISOString(),
      };
      const dedupeKey = buildActivoDedupeKey(
        activo.descripcion,
        activo.moneda ?? "ARS",
        activo.valor_estimado == null ? null : Number(activo.valor_estimado)
      );
      if (existingActivoKeys.has(dedupeKey) || seenActivoKeys.has(dedupeKey)) continue;
      const { error } = await supabase.from("activos").insert(activo);
      if (error) return { error: error.message };
      seenActivoKeys.add(dedupeKey);
      activosCount += 1;
    }
  }

  if (pat?.lineas_detalle) {
    for (const row of pat.lineas_detalle) {
      const descripcion = row.descripcion?.trim();
      if (!descripcion) continue;
      const valor = parseImporteNumber(row.importe);
      const activo: ActivosInsert = {
        expediente_id: expedienteId,
        created_by: userId,
        tipo: "activo",
        categoria: "otro",
        descripcion,
        valor_estimado: valor,
        moneda: "ARS",
        notas: `Línea · doc ${documentoId}`,
        origen: "ia",
        validado_por: userId,
        validado_at: new Date().toISOString(),
      };
      const dedupeKey = buildActivoDedupeKey(
        activo.descripcion,
        activo.moneda ?? "ARS",
        activo.valor_estimado == null ? null : Number(activo.valor_estimado)
      );
      if (existingActivoKeys.has(dedupeKey) || seenActivoKeys.has(dedupeKey)) continue;
      const { error } = await supabase.from("activos").insert(activo);
      if (error) return { error: error.message };
      seenActivoKeys.add(dedupeKey);
      activosCount += 1;
    }
  }

  revalidatePath(`/expedientes/${expedienteId}`);
  revalidateDocumentPaths(expedienteId, documentoId);
  return {
    error: null,
    created: { sujetos: sujetosCount, activos: activosCount },
  };
};
