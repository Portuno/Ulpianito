import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Documento } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DocumentDetailWorkspace } from "@/components/expedientes/document-detail-workspace";

type Props = {
  params: Promise<{ id: string; documentoId: string }>;
};

const DocumentDetailPage = async ({ params }: Props) => {
  const { id: expedienteId, documentoId } = await params;
  const supabase = await createClient();

  const { data: docData } = await supabase
    .from("documentos")
    .select("*")
    .eq("id", documentoId)
    .eq("expediente_id", expedienteId)
    .single();

  const documento = (docData as Documento | null) ?? null;

  if (!documento) notFound();

  const { data: signed } = await supabase.storage
    .from("documentos")
    .createSignedUrl(documento.storage_path, 3600);

  const viewerUrl = signed?.signedUrl ?? null;
  const mime = documento.mime_type ?? "";
  const viewerKind = mime.startsWith("image/")
    ? "image"
    : mime === "application/pdf"
      ? "pdf"
      : "other";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/expedientes/${expedienteId}`}
            className="gap-2"
            aria-label="Volver al expediente"
          >
            <ArrowLeft className="h-4 w-4" />
            Expediente
          </Link>
        </Button>
      </div>

      <DocumentDetailWorkspace
        expedienteId={expedienteId}
        documento={documento}
        viewerUrl={viewerUrl}
        viewerKind={viewerKind}
      />
    </div>
  );
};

export default DocumentDetailPage;
