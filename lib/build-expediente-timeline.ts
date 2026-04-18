import type {
  Documento,
  Evento,
  Expediente,
  Factura,
} from "@/lib/types/database";

export type ExpedienteTimelineItem = {
  id: string;
  at: string;
  label: string;
  detail?: string;
  kind:
    | "expediente"
    | "plataforma"
    | "documento"
    | "factura"
    | "evento"
    | "hito";
};

export const buildExpedienteTimeline = (
  expediente: Expediente,
  documentos: Documento[],
  facturas: Factura[],
  eventos: Evento[],
): ExpedienteTimelineItem[] => {
  const items: ExpedienteTimelineItem[] = [];

  items.push({
    id: `exp-${expediente.id}-creado`,
    at: expediente.created_at,
    label: "Expediente creado en la plataforma",
    kind: "plataforma",
  });

  if (expediente.updated_at !== expediente.created_at) {
    items.push({
      id: `exp-${expediente.id}-actualizado`,
      at: expediente.updated_at,
      label: "Datos del expediente actualizados",
      kind: "expediente",
    });
  }

  for (const d of documentos) {
    items.push({
      id: `doc-${d.id}`,
      at: d.created_at,
      label: "Documento incorporado al expediente",
      detail: d.nombre,
      kind: "documento",
    });
  }

  for (const f of facturas) {
    const fechaAt = f.fecha.includes("T")
      ? f.fecha
      : `${f.fecha}T12:00:00.000Z`;
    items.push({
      id: `fac-${f.id}`,
      at: fechaAt,
      label: "Hecho económico / factura en expediente",
      detail: f.numero_factura,
      kind: "factura",
    });
  }

  for (const e of eventos) {
    items.push({
      id: `evt-${e.id}`,
      at: e.fecha_evento,
      label: e.titulo,
      detail: e.descripcion ?? undefined,
      kind: e.tipo_evento === "hito" ? "hito" : "evento",
    });
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 60);
};
