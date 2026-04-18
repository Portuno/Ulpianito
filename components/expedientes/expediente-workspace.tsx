"use client";

import { useState } from "react";
import Link from "next/link";
import { FileStack, FolderKanban, PieChart, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocumentalTab } from "@/components/expedientes/documental-tab";
import { SujetosTab } from "@/components/expedientes/sujetos-tab";
import { PatrimonialTab } from "@/components/expedientes/patrimonial-tab";
import { MiscelaneoTab } from "@/components/expedientes/miscelaneo-tab";
import { ExpedienteTimeline } from "@/components/expedientes/expediente-timeline";
import { DocumentUploader } from "@/components/expedientes/document-uploader";
import type { ExpedienteTimelineItem } from "@/lib/build-expediente-timeline";
import type {
  Documento,
  Expediente,
  Factura,
  Sujeto,
} from "@/lib/types/database";
import type {
  DocumentalResumen,
  MiscelaneoResumen,
  PatrimonialResumen,
  SujetosResumen,
} from "@/lib/expediente-view-model";
import { cn } from "@/lib/utils";

type ExpedienteWorkspaceProps = {
  expedienteId: string;
  expediente: Expediente;
  documentos: Documento[];
  sujetos: Sujeto[];
  facturas: Factura[];
  sujetosResumen: SujetosResumen;
  patrimonialResumen: PatrimonialResumen;
  documentalResumen: DocumentalResumen;
  miscelaneoResumen: MiscelaneoResumen;
  timelineItems: ExpedienteTimelineItem[];
};

const formatMoney = (amount: number | null, currency: string) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency === "ARS" ? "ARS" : "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const EstadoBadge = ({ estado }: { estado: string }) => {
  const e = estado.toLowerCase();
  const isActivo = e === "activo" || e === "active";
  return (
    <Badge
      className={cn(
        isActivo &&
          "border border-emerald-600/30 bg-emerald-600/12 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200",
      )}
      variant={isActivo ? "outline" : "secondary"}
    >
      {estado}
    </Badge>
  );
};

const Row = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => (
  <div className="flex justify-between gap-2 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="max-w-[60%] truncate text-right font-medium">
      {value?.trim() ? value : "—"}
    </span>
  </div>
);

export const ExpedienteWorkspace = ({
  expedienteId,
  expediente,
  documentos,
  sujetos,
  facturas,
  sujetosResumen,
  patrimonialResumen,
  documentalResumen,
  miscelaneoResumen,
  timelineItems,
}: ExpedienteWorkspaceProps) => {
  const [tab, setTab] = useState("resumen");

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border bg-gradient-to-r from-background via-background to-muted/20 p-5 shadow-sm ring-1 ring-primary/10 backdrop-blur-sm dark:from-background dark:via-background dark:to-muted/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {expediente.titulo}
              </h1>
              <EstadoBadge estado={expediente.estado} />
            </div>
            {expediente.descripcion?.trim() ? (
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {expediente.descripcion}
              </p>
            ) : null}
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/agentes" aria-label="Ir a flujos para generar escrito">
                Generar Escrito
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link
                href="/validacion"
                aria-label="Ir a validación de entidades HITL"
              >
                Validar Entidades
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full flex-col">
        <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 rounded-xl border bg-muted/70 p-1 shadow-inner">
          <TabsTrigger value="resumen" className="h-8 rounded-lg px-3 text-xs sm:text-sm">
            Vista general
          </TabsTrigger>
          <TabsTrigger value="documental" className="h-8 rounded-lg px-3 text-xs sm:text-sm">
            Documental
          </TabsTrigger>
          <TabsTrigger value="sujetos" className="h-8 rounded-lg px-3 text-xs sm:text-sm">
            Sujetos
          </TabsTrigger>
          <TabsTrigger value="patrimonial" className="h-8 rounded-lg px-3 text-xs sm:text-sm">
            Patrimonial
          </TabsTrigger>
          <TabsTrigger value="miscelaneo" className="h-8 rounded-lg px-3 text-xs sm:text-sm">
            Misceláneo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-6 w-full space-y-8">
          <div className="grid w-full gap-4 md:grid-cols-2">
            <Card className="flex min-h-64 flex-col overflow-hidden border-primary/15 bg-gradient-to-b from-background to-muted/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileStack
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Documental
                  </CardTitle>
                  <Badge variant="secondary" className="font-normal">
                    {documentalResumen.count} doc.
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Carga y trazabilidad documental en el expediente.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <DocumentUploader
                  expedienteId={expedienteId}
                  variant="compact"
                />
                {documentalResumen.lastUploadAt && (
                  <p className="text-xs text-muted-foreground">
                    Última incorporación:{" "}
                    {new Date(documentalResumen.lastUploadAt).toLocaleString(
                      "es-ES",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}
                  </p>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/30 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setTab("documental")}
                  aria-label="Abrir sección documental completa"
                >
                  Ver tabla y gestión documental
                </Button>
              </CardFooter>
            </Card>

            <Card className="min-h-64 border-primary/15 bg-gradient-to-b from-background to-muted/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Sujetos
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Partes y representación relevante.
                </p>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Row label="Actor / Demandante" value={sujetosResumen.actor} />
                <Row label="Demandado" value={sujetosResumen.demandado} />
                <Row
                  label="Representante"
                  value={sujetosResumen.representante}
                />
              </CardContent>
              <CardFooter className="border-t bg-muted/30 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setTab("sujetos")}
                >
                  Gestionar sujetos
                </Button>
              </CardFooter>
            </Card>

            <Card className="min-h-64 border-primary/15 bg-gradient-to-b from-background to-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Patrimonial
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {patrimonialResumen.source === "activos"
                    ? "Resumen desde bienes registrados."
                    : "Resumen desde facturas extraídas."}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Row
                  label="Inmuebles"
                  value={
                    patrimonialResumen.inmuebles != null
                      ? String(patrimonialResumen.inmuebles)
                      : null
                  }
                />
                <Row
                  label="Vehículos"
                  value={
                    patrimonialResumen.vehiculos != null
                      ? String(patrimonialResumen.vehiculos)
                      : null
                  }
                />
                <Row
                  label="Monto total (ref.)"
                  value={
                    patrimonialResumen.montoTotal != null
                      ? formatMoney(
                          patrimonialResumen.montoTotal,
                          patrimonialResumen.moneda,
                        )
                      : null
                  }
                />
              </CardContent>
              <CardFooter className="border-t bg-muted/30 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setTab("patrimonial")}
                >
                  Ver detalle patrimonial
                </Button>
              </CardFooter>
            </Card>

            <Card className="min-h-64 border-primary/15 bg-gradient-to-b from-background to-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderKanban
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Misceláneo
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Tipo de asunto y notas internas.
                </p>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Row label="Tipo" value={miscelaneoResumen.tipo} />
                <Row
                  label="Jurisdicción"
                  value={miscelaneoResumen.jurisdiccion}
                />
                {miscelaneoResumen.notasPreview && (
                  <p className="line-clamp-3 rounded-md bg-muted/50 p-2 text-xs leading-relaxed text-muted-foreground">
                    {miscelaneoResumen.notasPreview}
                  </p>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/30 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setTab("miscelaneo")}
                >
                  Ver ficha miscelánea
                </Button>
              </CardFooter>
            </Card>
          </div>

          <ExpedienteTimeline items={timelineItems} />
        </TabsContent>

        <TabsContent value="documental" className="mt-6 w-full">
          <DocumentalTab expedienteId={expedienteId} documentos={documentos} />
        </TabsContent>

        <TabsContent value="sujetos" className="mt-6 w-full">
          <SujetosTab expedienteId={expedienteId} sujetos={sujetos} />
        </TabsContent>

        <TabsContent value="patrimonial" className="mt-6 w-full">
          <PatrimonialTab facturas={facturas} />
        </TabsContent>

        <TabsContent value="miscelaneo" className="mt-6 w-full">
          <MiscelaneoTab expediente={expediente} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
