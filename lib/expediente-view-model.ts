import type {
  Activo,
  Documento,
  Expediente,
  Factura,
  Sujeto,
} from "@/lib/types/database";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

const pickFirstMatch = (
  sujetos: Sujeto[],
  patterns: RegExp[],
): string | null => {
  for (const s of sujetos) {
    const r = normalize(s.rol_procesal);
    if (patterns.some((p) => p.test(r))) return s.nombre;
  }
  return null;
};

export type SujetosResumen = {
  actor: string | null;
  demandado: string | null;
  representante: string | null;
};

export const buildSujetosResumen = (sujetos: Sujeto[]): SujetosResumen => {
  return {
    actor: pickFirstMatch(sujetos, [
      /^actor/,
      /demandante/,
      /actor civil/,
      /querellante/,
    ]),
    demandado: pickFirstMatch(sujetos, [/^demandad/, /demandad[oa]/]),
    representante: pickFirstMatch(sujetos, [
      /representante/,
      /apoderad/,
      /letrad/,
      /procurador/,
    ]),
  };
};

export type PatrimonialResumen = {
  /** null cuando el desglose solo aplica con inventario de `activos`. */
  inmuebles: number | null;
  vehiculos: number | null;
  montoTotal: number | null;
  moneda: string;
  source: "activos" | "facturas";
};

export const buildPatrimonialResumen = (
  activos: Activo[],
  facturas: Factura[],
): PatrimonialResumen => {
  if (activos.length > 0) {
    const inmuebles = activos.filter((a) => a.categoria === "inmueble").length;
    const vehiculos = activos.filter((a) => a.categoria === "vehiculo").length;
    const withValue = activos.filter((a) => a.valor_estimado != null);
    const montoTotal =
      withValue.length > 0
        ? withValue.reduce(
            (sum, a) => sum + Number(a.valor_estimado ?? 0),
            0,
          )
        : null;
    const moneda = activos[0]?.moneda ?? "EUR";
    return {
      inmuebles,
      vehiculos,
      montoTotal,
      moneda,
      source: "activos",
    };
  }

  const total = facturas.reduce((sum, f) => sum + Number(f.total), 0);
  return {
    inmuebles: null,
    vehiculos: null,
    montoTotal: facturas.length > 0 ? total : null,
    moneda: "EUR",
    source: "facturas",
  };
};

export type DocumentalResumen = {
  count: number;
  lastUploadAt: string | null;
};

export const buildDocumentalResumen = (
  documentos: Documento[],
): DocumentalResumen => {
  if (documentos.length === 0) {
    return { count: 0, lastUploadAt: null };
  }
  const last = documentos.reduce((best, d) =>
    new Date(d.created_at) > new Date(best.created_at) ? d : best,
  );
  return { count: documentos.length, lastUploadAt: last.created_at };
};

export type MiscelaneoResumen = {
  tipo: string;
  jurisdiccion: string | null;
  notasPreview: string | null;
};

export const buildMiscelaneoResumen = (
  expediente: Expediente,
): MiscelaneoResumen => {
  const raw = expediente.notas?.trim() ?? "";
  const notasPreview =
    raw.length > 0
      ? raw.length > 90
        ? `${raw.slice(0, 90)}…`
        : raw
      : null;
  return {
    tipo: expediente.tipo,
    jurisdiccion: expediente.jurisdiccion ?? null,
    notasPreview,
  };
};
