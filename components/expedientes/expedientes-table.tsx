"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { Expediente } from "@/lib/types/database";

type ExpedientesTableProps = {
  expedientes: Expediente[];
};

const ESTADO_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  activo: "default",
  archivado: "secondary",
  cerrado: "outline",
};

const TIPO_LABELS: Record<string, string> = {
  facturacion: "Facturación",
  herencias: "Herencias",
  propiedad_intelectual: "Prop. Intelectual",
  inmobiliario: "Inmobiliario",
  corporativo: "Corporativo",
  laboral: "Laboral",
};

export const ExpedientesTable = ({ expedientes }: ExpedientesTableProps) => {
  if (expedientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-lg font-medium">No hay expedientes</p>
        <p className="text-sm text-muted-foreground">
          Crea tu primer expediente para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expedientes.map((exp) => (
            <TableRow key={exp.id}>
              <TableCell className="font-mono text-sm">
                {exp.numero_expediente}
              </TableCell>
              <TableCell className="font-medium">{exp.titulo}</TableCell>
              <TableCell>{TIPO_LABELS[exp.tipo] ?? exp.tipo}</TableCell>
              <TableCell>
                <Badge variant={ESTADO_VARIANT[exp.estado] ?? "default"}>
                  {exp.estado}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(exp.created_at).toLocaleDateString("es-ES")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label={`Ver expediente ${exp.numero_expediente}`}
                >
                  <Link href={`/expedientes/${exp.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
