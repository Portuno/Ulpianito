import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createUserSupabase } from "../_shared/supabase-user.ts";

type Body = { documento_id: string };

const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.0-flash";

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

const EXTRACTION_PROMPT = `Sos un asistente jurídico. Analizá el documento adjunto y devolvé ÚNICAMENTE un JSON válido (sin markdown) con esta forma exacta de claves (podés usar null o listas vacías donde no aplique):
{
  "schema_version": 1,
  "clasificacion": {
    "tipo_documento_detectado": string,
    "idioma": string,
    "resumen_corto": string
  },
  "partes_y_proceso": {
    "personas_juridicas": [{ "nombre": string, "rol": string, "identificadores": string }],
    "personas_fisicas": [{ "nombre": string, "rol": string, "documento": string }],
    "organos_jurisdiccionales": [{ "nombre": string, "referencia": string }],
    "fechas_relevantes": [{ "descripcion": string, "fecha": string }],
    "referencias_procesales": string[]
  },
  "aspecto_patrimonial": {
    "importes": [{ "concepto": string, "importe": string, "moneda": string }],
    "lineas_detalle": [{ "descripcion": string, "cantidad": string, "importe": string }]
  },
  "otros": {
    "observaciones": string,
    "campos_adicionales": { }
  }
}
No priorices un tipo de ítem sobre otro; extraé lo relevante de forma neutral. Si un dato no está en el documento, dejalo vacío o omití el campo.`;

const parseJsonFromModelText = (text: string): Record<string, unknown> => {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const raw = fence ? fence[1].trim() : trimmed;
  return JSON.parse(raw) as Record<string, unknown>;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonResponse({ error: "JSON inválido" }, 400);
  }

  if (!body.documento_id) {
    return jsonResponse({ error: "documento_id requerido" }, 400);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse(
      { error: "GEMINI_API_KEY no configurada en el proyecto Edge" },
      500
    );
  }

  const supabase = createUserSupabase(req);

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: "No autenticado" }, 401);
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("despacho_id")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) {
    return jsonResponse({ error: "Perfil no encontrado" }, 403);
  }

  const { data: docRow, error: docErr } = await supabase
    .from("documentos")
    .select("id, expediente_id, storage_path, mime_type, nombre")
    .eq("id", body.documento_id)
    .single();

  if (docErr || !docRow) {
    return jsonResponse({ error: "Documento no encontrado" }, 404);
  }

  const { data: expedienteRow, error: expErr } = await supabase
    .from("expedientes")
    .select("despacho_id")
    .eq("id", docRow.expediente_id)
    .single();

  if (expErr || !expedienteRow || expedienteRow.despacho_id !== profile.despacho_id) {
    return jsonResponse({ error: "No autorizado" }, 403);
  }

  await supabase
    .from("documentos")
    .update({
      extraction_status: "processing",
      extraction_error: null,
    })
    .eq("id", body.documento_id);

  try {
    const { data: fileBlob, error: dlErr } = await supabase.storage
      .from("documentos")
      .download(docRow.storage_path);

    if (dlErr || !fileBlob) {
      throw new Error(dlErr?.message ?? "No se pudo descargar el archivo");
    }

    const buf = new Uint8Array(await fileBlob.arrayBuffer());
    const base64 = bytesToBase64(buf);
    const mime =
      docRow.mime_type && docRow.mime_type !== "application/octet-stream"
        ? docRow.mime_type
        : "application/pdf";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: EXTRACTION_PROMPT },
              {
                inline_data: {
                  mime_type: mime,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    const geminiJson = (await geminiRes.json()) as {
      error?: { message?: string };
      candidates?: {
        content?: { parts?: { text?: string }[] };
      }[];
    };

    if (!geminiRes.ok) {
      const msg =
        geminiJson.error?.message ?? `Gemini HTTP ${geminiRes.status}`;
      throw new Error(msg);
    }

    const text =
      geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ??
      JSON.stringify(geminiJson.candidates?.[0]?.content?.parts?.[0] ?? {});

    if (!text || text === "{}") {
      throw new Error("Respuesta vacía del modelo");
    }

    let report: Record<string, unknown>;
    try {
      report = parseJsonFromModelText(text);
    } catch {
      throw new Error("El modelo no devolvió JSON válido");
    }

    const clas = report["clasificacion"] as
      | { tipo_documento_detectado?: string }
      | undefined;
    const tipoDetectado =
      typeof clas?.tipo_documento_detectado === "string" &&
      clas.tipo_documento_detectado.trim() !== ""
        ? clas.tipo_documento_detectado.trim()
        : null;

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      extraction_status: "done",
      extraction_report: report,
      extraction_error: null,
      extraction_at: now,
      extraction_model: GEMINI_MODEL,
    };
    if (tipoDetectado) {
      updatePayload["tipo_documento"] = tipoDetectado;
    }

    await supabase
      .from("documentos")
      .update(updatePayload)
      .eq("id", body.documento_id);

    return jsonResponse({ ok: true, extraction_report: report });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await supabase
      .from("documentos")
      .update({
        extraction_status: "failed",
        extraction_error: message,
      })
      .eq("id", body.documento_id);

    return jsonResponse({ error: message }, 422);
  }
});
