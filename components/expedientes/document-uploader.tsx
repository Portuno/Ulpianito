"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { uploadDocument } from "@/app/(dashboard)/expedientes/actions";
import { toast } from "sonner";

type DocumentUploaderProps = {
  expedienteId: string;
  /** Zona de carga más discreta (p. ej. vista general del expediente). */
  variant?: "default" | "compact";
};

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg,.docx";
const MAX_SIZE_MB = 10;

export const DocumentUploader = ({
  expedienteId,
  variant = "default",
}: DocumentUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCompact = variant === "compact";

  const handleUpload = async (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`El archivo excede ${MAX_SIZE_MB}MB`);
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("expediente_id", expedienteId);

    const result = await uploadDocument(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Documento subido correctamente");
    }

    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const dropzone = (
    <div
      role="button"
      tabIndex={0}
      aria-label="Arrastra o selecciona un archivo para subir"
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors ${
        isCompact ? "px-3 py-4" : "p-8"
      } ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      {isUploading ? (
        <Loader2
          className={`animate-spin text-muted-foreground ${isCompact ? "h-6 w-6" : "h-8 w-8"}`}
        />
      ) : (
        <Upload
          className={`text-muted-foreground ${isCompact ? "h-6 w-6" : "h-8 w-8"}`}
        />
      )}
      <p className={`font-medium ${isCompact ? "mt-1 text-xs" : "mt-2 text-sm"}`}>
        {isUploading
          ? "Analizando semánticamente con Gemini..."
          : isCompact
            ? "Suelta aquí o elige archivo"
            : "Arrastra un archivo o haz clic para seleccionar"}
      </p>
      <p
        className={`text-muted-foreground ${isCompact ? "mt-0.5 text-[11px]" : "mt-1 text-xs"}`}
      >
        PDF, PNG, JPG, DOCX (máx. {MAX_SIZE_MB}MB)
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );

  if (isCompact) {
    return dropzone;
  }

  return (
    <Card>
      <CardContent className="pt-6">{dropzone}</CardContent>
    </Card>
  );
};
