import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Expediente } from "@/lib/types/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DocumentalTab } from "@/components/expedientes/documental-tab";
import { SujetosTab } from "@/components/expedientes/sujetos-tab";
import { PatrimonialTab } from "@/components/expedientes/patrimonial-tab";
import { MiscelaneoTab } from "@/components/expedientes/miscelaneo-tab";

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

  const [{ data: documentos }, { data: sujetos }, { data: facturas }] =
    await Promise.all([
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
    ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {expediente.titulo}
          </h1>
          <Badge>{expediente.estado}</Badge>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          {expediente.numero_expediente}
        </p>
        {expediente.descripcion && (
          <p className="mt-1 text-sm text-muted-foreground">
            {expediente.descripcion}
          </p>
        )}
      </div>

      <Tabs defaultValue="documental">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documental">Documental</TabsTrigger>
          <TabsTrigger value="sujetos">Sujetos</TabsTrigger>
          <TabsTrigger value="patrimonial">Patrimonial</TabsTrigger>
          <TabsTrigger value="miscelaneo">Misceláneo</TabsTrigger>
        </TabsList>

        <TabsContent value="documental" className="mt-6">
          <DocumentalTab
            expedienteId={id}
            documentos={documentos ?? []}
          />
        </TabsContent>

        <TabsContent value="sujetos" className="mt-6">
          <SujetosTab expedienteId={id} sujetos={sujetos ?? []} />
        </TabsContent>

        <TabsContent value="patrimonial" className="mt-6">
          <PatrimonialTab facturas={facturas ?? []} />
        </TabsContent>

        <TabsContent value="miscelaneo" className="mt-6">
          <MiscelaneoTab expediente={expediente} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpedienteDetailPage;
