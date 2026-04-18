"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Image, File, Trash2 } from "lucide-react";
import { deleteDocument } from "@/app/(dashboard)/expedientes/actions";
import { toast } from "sonner";
import type { Documento } from "@/lib/types/database";

type DocumentListProps = {
  expedienteId: string;
  documentos: Documento[];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType === "application/pdf") return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const tipoEtiqueta = (doc: Documento) => {
  const t = doc.tipo_documento?.trim();
  if (t) return t;
  if (doc.mime_type === "application/pdf") return "PDF";
  if (doc.mime_type.startsWith("image/")) return "Imagen";
  if (
    doc.mime_type.includes("wordprocessingml") ||
    doc.mime_type.includes("msword")
  ) {
    return "Word";
  }
  return doc.mime_type || "—";
};

const estadoIa = (doc: Documento) => {
  if (doc.validado_at) return "Validado";
  if (doc.origen === "ia") return "Pendiente de revisión";
  return "Sin validar IA";
};

export const DocumentList = ({
  expedienteId,
  documentos,
}: DocumentListProps) => {
  const handleDelete = async (doc: Documento) => {
    if (!confirm("¿Eliminar este documento?")) return;
    await deleteDocument(doc.id, doc.storage_path, expedienteId);
    toast.success("Documento eliminado");
  };

  if (documentos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No hay documentos en este expediente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Documentos ({documentos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Validación IA</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentos.map((doc) => {
              const Icon = getFileIcon(doc.mime_type);
              return (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="truncate text-sm font-medium">
                        {doc.nombre}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tipoEtiqueta(doc)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatFileSize(doc.size_bytes)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell className="text-sm">{estadoIa(doc)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar ${doc.nombre}`}
                      onClick={() => handleDelete(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
