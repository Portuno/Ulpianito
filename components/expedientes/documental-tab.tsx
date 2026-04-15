import { DocumentUploader } from "./document-uploader";
import { DocumentList } from "./document-list";
import type { Documento } from "@/lib/types/database";

type DocumentalTabProps = {
  expedienteId: string;
  documentos: Documento[];
};

export const DocumentalTab = ({
  expedienteId,
  documentos,
}: DocumentalTabProps) => {
  return (
    <div className="space-y-6">
      <DocumentUploader expedienteId={expedienteId} />
      <DocumentList expedienteId={expedienteId} documentos={documentos} />
    </div>
  );
};
