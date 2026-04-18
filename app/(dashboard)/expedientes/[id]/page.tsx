import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Expediente } from "@/lib/types/database";
import { ExpedienteWorkspace } from "@/components/expedientes/expediente-workspace";
import { buildExpedienteTimeline } from "@/lib/build-expediente-timeline";
import {
  buildDocumentalResumen,
  buildMiscelaneoResumen,
  buildPatrimonialResumen,
  buildSujetosResumen,
} from "@/lib/expediente-view-model";

type Props = {
  params: Promise<{ id: string }>;
};

const ExpedienteDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const supabase = await createClient();

  const { data: expedienteData } = await supabase
    .from("expedientes")
    .select("*")
    .eq("id", id)
    .single();

  const expediente = (expedienteData as Expediente | null) ?? null;

  if (!expediente) notFound();

  const [
    { data: documentos },
    { data: sujetos },
    { data: facturas },
    { data: activos },
    { data: eventos },
  ] = await Promise.all([
    supabase
      .from("documentos")
      .select("*")
      .eq("expediente_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("sujetos")
      .select("*")
      .eq("expediente_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("facturas")
      .select("*")
      .eq("expediente_id", id)
      .order("fecha", { ascending: false }),
    supabase
      .from("activos")
      .select("*")
      .eq("expediente_id", id),
    supabase
      .from("eventos")
      .select("*")
      .eq("expediente_id", id)
      .order("fecha_evento", { ascending: false }),
  ]);

  const docList = documentos ?? [];
  const sujList = sujetos ?? [];
  const facList = facturas ?? [];
  const actList = activos ?? [];
  const evtList = eventos ?? [];

  const timelineItems = buildExpedienteTimeline(
    expediente,
    docList,
    facList,
    evtList,
  );

  return (
    <ExpedienteWorkspace
      expedienteId={id}
      expediente={expediente}
      documentos={docList}
      sujetos={sujList}
      facturas={facList}
      sujetosResumen={buildSujetosResumen(sujList)}
      patrimonialResumen={buildPatrimonialResumen(actList, facList)}
      documentalResumen={buildDocumentalResumen(docList)}
      miscelaneoResumen={buildMiscelaneoResumen(expediente)}
      timelineItems={timelineItems}
    />
  );
};

export default ExpedienteDetailPage;
