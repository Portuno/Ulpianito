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
          "border-0 bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-200",
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
    <div className="space-y-6 rounded-xl bg-slate-50 p-3 text-slate-900 md:p-4 dark:bg-background dark:text-foreground">
      <header className="rounded-2xl border-0 bg-white p-5 shadow-sm ring-1 ring-slate-200/80 backdrop-blur-sm dark:bg-card dark:ring-border">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {expediente.titulo}
              </h1>
              <EstadoBadge estado={expediente.estado} />
            </div>
            {expediente.descripcion?.trim() ? (
              <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-muted-foreground">
                {expediente.descripcion}
              </p>
            ) : null}
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800"
              asChild
            >
              <Link href="/agentes" aria-label="Ir a flujos para generar escrito">
                Generar Escrito
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-300 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-border"
              asChild
            >
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
        <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-border dark:bg-muted/70">
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

        <TabsContent value="resumen" className="mt-6 w-full">
          <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
            <div className="grid w-full gap-4 md:grid-cols-2">
              <Card className="flex min-h-64 flex-col overflow-hidden rounded-xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-card dark:ring-border">
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
                <p className="text-xs text-slate-500 dark:text-muted-foreground">
                  Carga y trazabilidad documental en el expediente.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <DocumentUploader
                  expedienteId={expedienteId}
                  variant="compact"
                />
                {documentalResumen.lastUploadAt && (
                  <p className="text-xs text-slate-500 dark:text-muted-foreground">
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
              <CardFooter className="border-t border-slate-100 bg-white/80 pt-3 dark:border-border dark:bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-900 hover:underline dark:text-foreground"
                  onClick={() => setTab("documental")}
                  aria-label="Abrir sección documental completa"
                >
                  Ver tabla y gestión documental
                </Button>
              </CardFooter>
              </Card>

              <Card className="min-h-64 rounded-xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-card dark:ring-border">
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
                <p className="text-xs text-slate-500 dark:text-muted-foreground">
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
              <CardFooter className="border-t border-slate-100 bg-white/80 pt-3 dark:border-border dark:bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-900 hover:underline dark:text-foreground"
                  onClick={() => setTab("sujetos")}
                >
                  Gestionar sujetos
                </Button>
              </CardFooter>
              </Card>

              <Card className="min-h-64 rounded-xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-card dark:ring-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Patrimonial
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-muted-foreground">
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
              <CardFooter className="border-t border-slate-100 bg-white/80 pt-3 dark:border-border dark:bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-900 hover:underline dark:text-foreground"
                  onClick={() => setTab("patrimonial")}
                >
                  Ver detalle patrimonial
                </Button>
              </CardFooter>
              </Card>

              <Card className="min-h-64 rounded-xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-card dark:ring-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderKanban
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Misceláneo
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-muted-foreground">
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
                  <p className="line-clamp-3 rounded-md bg-slate-50 p-2 text-xs leading-relaxed text-slate-500 dark:bg-muted/50 dark:text-muted-foreground">
                    {miscelaneoResumen.notasPreview}
                  </p>
                )}
              </CardContent>
              <CardFooter className="border-t border-slate-100 bg-white/80 pt-3 dark:border-border dark:bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-900 hover:underline dark:text-foreground"
                  onClick={() => setTab("miscelaneo")}
                >
                  Ver ficha miscelánea
                </Button>
              </CardFooter>
              </Card>
            </div>

            <aside className="xl:sticky xl:top-6 xl:h-fit">
              <ExpedienteTimeline items={timelineItems} title="Actividad reciente" compact />
            </aside>
          </div>
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
