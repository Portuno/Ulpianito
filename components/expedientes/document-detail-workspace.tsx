"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { DocumentExtractionReport, Documento } from "@/lib/types/database";
import {
  applyExtractionToExpediente,
  runDocumentExtraction,
  saveDocumentExtractionReport,
  validateDocumentExtraction,
} from "@/app/(dashboard)/expedientes/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Sparkles, CheckCircle2, Save, Database } from "lucide-react";

type DocumentDetailWorkspaceProps = {
  expedienteId: string;
  documento: Documento;
  viewerUrl: string | null;
  viewerKind: "pdf" | "image" | "other";
};

const emptyReport = (): DocumentExtractionReport => ({
  schema_version: 1,
  clasificacion: {
    tipo_documento_detectado: "",
    idioma: "",
    resumen_corto: "",
  },
  partes_y_proceso: {
    personas_juridicas: [],
    personas_fisicas: [],
    organos_jurisdiccionales: [],
    fechas_relevantes: [],
    referencias_procesales: [],
  },
  aspecto_patrimonial: {
    importes: [],
    lineas_detalle: [],
  },
  otros: {
    observaciones: "",
    campos_adicionales: {},
  },
});

const mergeReport = (
  raw: DocumentExtractionReport | null | undefined
): DocumentExtractionReport => {
  const e = emptyReport();
  if (!raw) return e;
  return {
    schema_version: raw.schema_version ?? 1,
    clasificacion: { ...e.clasificacion, ...raw.clasificacion },
    partes_y_proceso: {
      personas_juridicas: [
        ...(raw.partes_y_proceso?.personas_juridicas ?? []),
      ],
      personas_fisicas: [...(raw.partes_y_proceso?.personas_fisicas ?? [])],
      organos_jurisdiccionales: [
        ...(raw.partes_y_proceso?.organos_jurisdiccionales ?? []),
      ],
      fechas_relevantes: [...(raw.partes_y_proceso?.fechas_relevantes ?? [])],
      referencias_procesales: [
        ...(raw.partes_y_proceso?.referencias_procesales ?? []),
      ],
    },
    aspecto_patrimonial: {
      importes: [...(raw.aspecto_patrimonial?.importes ?? [])],
      lineas_detalle: [...(raw.aspecto_patrimonial?.lineas_detalle ?? [])],
    },
    otros: {
      observaciones: raw.otros?.observaciones ?? "",
      campos_adicionales: { ...raw.otros?.campos_adicionales },
    },
  };
};

const statusLabel = (s: string) => {
  switch (s) {
    case "pending":
      return "Pendiente de análisis";
    case "processing":
      return "Extrayendo…";
    case "done":
      return "Extracción lista";
    case "failed":
      return "Error en extracción";
    default:
      return s;
  }
};

export const DocumentDetailWorkspace = ({
  expedienteId,
  documento,
  viewerUrl,
  viewerKind,
}: DocumentDetailWorkspaceProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<DocumentExtractionReport>(() =>
    mergeReport(documento.extraction_report)
  );

  useEffect(() => {
    setReport(mergeReport(documento.extraction_report));
  }, [documento.id, documento.extraction_at]);

  const referenciasText = useMemo(() => {
    const list = report.partes_y_proceso?.referencias_procesales ?? [];
    return list.join("\n");
  }, [report.partes_y_proceso?.referencias_procesales]);

  const handleReferenciasChange = (value: string) => {
    const lines = value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setReport((prev) => ({
      ...prev,
      partes_y_proceso: {
        ...prev.partes_y_proceso!,
        referencias_procesales: lines,
      },
    }));
  };

  const handleRunExtract = () => {
    startTransition(async () => {
      const res = await runDocumentExtraction(documento.id, expedienteId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Extracción completada");
      }
      router.refresh();
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveDocumentExtractionReport(
        documento.id,
        expedienteId,
        report
      );
      if (res.error) toast.error(res.error);
      else toast.success("Cambios guardados");
      router.refresh();
    });
  };

  const handleValidate = () => {
    startTransition(async () => {
      const res = await validateDocumentExtraction(documento.id, expedienteId);
      if (res.error) toast.error(res.error);
      else toast.success("Datos validados");
      router.refresh();
    });
  };

  const handleApply = () => {
    startTransition(async () => {
      const res = await applyExtractionToExpediente(documento.id, expedienteId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `Creado: ${res.created?.sujetos ?? 0} sujetos, ${res.created?.activos ?? 0} activos`
      );
      router.refresh();
    });
  };

  return (
    <div className="grid min-h-[72vh] gap-6 lg:grid-cols-[3fr_2fr]">
      <Card className="flex min-h-[420px] flex-col overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Documento original</CardTitle>
          <CardDescription className="truncate">{documento.nombre}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2 p-2 pt-0">
          {viewerUrl && viewerKind === "pdf" ? (
            <iframe
              title={`Vista de ${documento.nombre}`}
              src={viewerUrl}
              className="min-h-[560px] w-full flex-1 rounded-md border bg-muted/30"
            />
          ) : null}
          {viewerUrl && viewerKind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={viewerUrl}
              alt={documento.nombre}
              className="max-h-[70vh] w-full rounded-md border object-contain"
            />
          ) : null}
          {viewerUrl && viewerKind === "other" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-md border bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Vista previa no disponible para este formato. Podés descargar el
                archivo o convertirlo a PDF para verlo aquí.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href={viewerUrl} download={documento.nombre}>
                  Descargar archivo
                </a>
              </Button>
            </div>
          ) : null}
          {!viewerUrl ? (
            <p className="p-4 text-sm text-muted-foreground">
              No se pudo generar la URL de visualización.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 lg:max-h-[80vh] lg:overflow-y-auto lg:pr-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {statusLabel(documento.extraction_status ?? "pending")}
          </Badge>
          {documento.extraction_model ? (
            <Badge variant="outline" className="font-mono text-xs">
              {documento.extraction_model}
            </Badge>
          ) : null}
          {documento.validado_at ? (
            <Badge className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Validado
            </Badge>
          ) : null}
        </div>

        {documento.extraction_error ? (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {documento.extraction_error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleRunExtract}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Analizar con IA
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSave}
            disabled={isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Guardar cambios
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            disabled={
              isPending || (documento.extraction_status ?? "pending") !== "done"
            }
          >
            Validar datos
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleApply}
            disabled={
              isPending ||
              (documento.extraction_status ?? "pending") !== "done" ||
              !documento.validado_at
            }
          >
            <Database className="mr-2 h-4 w-4" />
            Aplicar al expediente
          </Button>
        </div>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Clasificación</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tipo-doc">Tipo detectado</Label>
              <Input
                id="tipo-doc"
                value={report.clasificacion?.tipo_documento_detectado ?? ""}
                onChange={(e) =>
                  setReport((p) => ({
                    ...p,
                    clasificacion: {
                      ...p.clasificacion,
                      tipo_documento_detectado: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="idioma">Idioma</Label>
              <Input
                id="idioma"
                value={report.clasificacion?.idioma ?? ""}
                onChange={(e) =>
                  setReport((p) => ({
                    ...p,
                    clasificacion: { ...p.clasificacion, idioma: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="resumen">Resumen corto</Label>
              <Input
                id="resumen"
                value={report.clasificacion?.resumen_corto ?? ""}
                onChange={(e) =>
                  setReport((p) => ({
                    ...p,
                    clasificacion: {
                      ...p.clasificacion,
                      resumen_corto: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Partes y proceso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Personas jurídicas</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReport((p) => ({
                      ...p,
                      partes_y_proceso: {
                        ...p.partes_y_proceso!,
                        personas_juridicas: [
                          ...(p.partes_y_proceso?.personas_juridicas ?? []),
                          { nombre: "", rol: "", identificadores: "" },
                        ],
                      },
                    }))
                  }
                >
                  Agregar fila
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Identificadores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(report.partes_y_proceso?.personas_juridicas ?? []).map(
                    (row, i) => (
                      <TableRow key={`pj-${i}`}>
                        <TableCell>
                          <Input
                            aria-label={`Persona jurídica ${i + 1} nombre`}
                            value={row.nombre ?? ""}
                            onChange={(e) => {
                              const next = [
                                ...(report.partes_y_proceso
                                  ?.personas_juridicas ?? []),
                              ];
                              next[i] = { ...next[i], nombre: e.target.value };
                              setReport((p) => ({
                                ...p,
                                partes_y_proceso: {
                                  ...p.partes_y_proceso!,
                                  personas_juridicas: next,
                                },
                              }));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            aria-label={`Persona jurídica ${i + 1} rol`}
                            value={row.rol ?? ""}
                            onChange={(e) => {
                              const next = [
                                ...(report.partes_y_proceso
                                  ?.personas_juridicas ?? []),
                              ];
                              next[i] = { ...next[i], rol: e.target.value };
                              setReport((p) => ({
                                ...p,
                                partes_y_proceso: {
                                  ...p.partes_y_proceso!,
                                  personas_juridicas: next,
                                },
                              }));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            aria-label={`Persona jurídica ${i + 1} identificadores`}
                            value={row.identificadores ?? ""}
                            onChange={(e) => {
                              const next = [
                                ...(report.partes_y_proceso
                                  ?.personas_juridicas ?? []),
                              ];
                              next[i] = {
                                ...next[i],
                                identificadores: e.target.value,
                              };
                              setReport((p) => ({
                                ...p,
                                partes_y_proceso: {
                                  ...p.partes_y_proceso!,
                                  personas_juridicas: next,
                                },
                              }));
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </section>

            <Separator />

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Personas físicas</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReport((p) => ({
                      ...p,
                      partes_y_proceso: {
                        ...p.partes_y_proceso!,
                        personas_fisicas: [
                          ...(p.partes_y_proceso?.personas_fisicas ?? []),
                          { nombre: "", rol: "", documento: "" },
                        ],
                      },
                    }))
                  }
                >
                  Agregar fila
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Documento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(report.partes_y_proceso?.personas_fisicas ?? []).map(
                    (row, i) => (
                      <TableRow key={`pf-${i}`}>
                        <TableCell>
                          <Input
                            value={row.nombre ?? ""}
                            onChange={(e) => {
                              const next = [
                                ...(report.partes_y_proceso?.personas_fisicas ??
                                  []),
                              ];
                              next[i] = { ...next[i], nombre: e.target.value };
                              setReport((p) => ({
                                ...p,
                                partes_y_proceso: {
                                  ...p.partes_y_proceso!,
                                  personas_fisicas: next,
                                },
                              }));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.rol ?? ""}
                            onChange={(e) => {
                              const next = [
                                ...(report.partes_y_proceso?.personas_fisicas ??
                                  []),
                              ];
                              next[i] = { ...next[i], rol: e.target.value };
                              setReport((p) => ({
                                ...p,
                                partes_y_proceso: {
                                  ...p.partes_y_proceso!,
                                  personas_fisicas: next,
                                },
                              }));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.documento ?? ""}
                            onChange={(e) => {
                              const next = [
                                ...(report.partes_y_proceso?.personas_fisicas ??
                                  []),
                              ];
                              next[i] = {
                                ...next[i],
                                documento: e.target.value,
                              };
                              setReport((p) => ({
                                ...p,
                                partes_y_proceso: {
                                  ...p.partes_y_proceso!,
                                  personas_fisicas: next,
                                },
                              }));
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </section>

            <div className="space-y-1.5">
              <Label htmlFor="refs">Referencias procesales (una por línea)</Label>
              <textarea
                id="refs"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={referenciasText}
                onChange={(e) => handleReferenciasChange(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Aspecto patrimonial / económico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Importes</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setReport((p) => ({
                    ...p,
                    aspecto_patrimonial: {
                      ...p.aspecto_patrimonial!,
                      importes: [
                        ...(p.aspecto_patrimonial?.importes ?? []),
                        { concepto: "", importe: "", moneda: "" },
                      ],
                    },
                  }))
                }
              >
                Agregar fila
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Moneda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report.aspecto_patrimonial?.importes ?? []).map((row, i) => (
                  <TableRow key={`imp-${i}`}>
                    <TableCell>
                      <Input
                        value={row.concepto ?? ""}
                        onChange={(e) => {
                          const next = [
                            ...(report.aspecto_patrimonial?.importes ?? []),
                          ];
                          next[i] = { ...next[i], concepto: e.target.value };
                          setReport((p) => ({
                            ...p,
                            aspecto_patrimonial: {
                              ...p.aspecto_patrimonial!,
                              importes: next,
                            },
                          }));
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.importe ?? ""}
                        onChange={(e) => {
                          const next = [
                            ...(report.aspecto_patrimonial?.importes ?? []),
                          ];
                          next[i] = { ...next[i], importe: e.target.value };
                          setReport((p) => ({
                            ...p,
                            aspecto_patrimonial: {
                              ...p.aspecto_patrimonial!,
                              importes: next,
                            },
                          }));
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.moneda ?? ""}
                        onChange={(e) => {
                          const next = [
                            ...(report.aspecto_patrimonial?.importes ?? []),
                          ];
                          next[i] = { ...next[i], moneda: e.target.value };
                          setReport((p) => ({
                            ...p,
                            aspecto_patrimonial: {
                              ...p.aspecto_patrimonial!,
                              importes: next,
                            },
                          }));
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator />

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Líneas de detalle</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setReport((p) => ({
                    ...p,
                    aspecto_patrimonial: {
                      ...p.aspecto_patrimonial!,
                      lineas_detalle: [
                        ...(p.aspecto_patrimonial?.lineas_detalle ?? []),
                        { descripcion: "", cantidad: "", importe: "" },
                      ],
                    },
                  }))
                }
              >
                Agregar fila
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report.aspecto_patrimonial?.lineas_detalle ?? []).map(
                  (row, i) => (
                    <TableRow key={`lin-${i}`}>
                      <TableCell>
                        <Input
                          value={row.descripcion ?? ""}
                          onChange={(e) => {
                            const next = [
                              ...(report.aspecto_patrimonial?.lineas_detalle ??
                                []),
                            ];
                            next[i] = {
                              ...next[i],
                              descripcion: e.target.value,
                            };
                            setReport((p) => ({
                              ...p,
                              aspecto_patrimonial: {
                                ...p.aspecto_patrimonial!,
                                lineas_detalle: next,
                              },
                            }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.cantidad ?? ""}
                          onChange={(e) => {
                            const next = [
                              ...(report.aspecto_patrimonial?.lineas_detalle ??
                                []),
                            ];
                            next[i] = { ...next[i], cantidad: e.target.value };
                            setReport((p) => ({
                              ...p,
                              aspecto_patrimonial: {
                                ...p.aspecto_patrimonial!,
                                lineas_detalle: next,
                              },
                            }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.importe ?? ""}
                          onChange={(e) => {
                            const next = [
                              ...(report.aspecto_patrimonial?.lineas_detalle ??
                                []),
                            ];
                            next[i] = { ...next[i], importe: e.target.value };
                            setReport((p) => ({
                              ...p,
                              aspecto_patrimonial: {
                                ...p.aspecto_patrimonial!,
                                lineas_detalle: next,
                              },
                            }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Otros</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="obs" className="sr-only">
              Observaciones
            </Label>
            <textarea
              id="obs"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              placeholder="Observaciones u otros datos relevantes"
              value={report.otros?.observaciones ?? ""}
              onChange={(e) =>
                setReport((p) => ({
                  ...p,
                  otros: { ...p.otros, observaciones: e.target.value },
                }))
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
