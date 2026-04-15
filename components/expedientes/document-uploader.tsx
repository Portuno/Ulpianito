"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { uploadDocument } from "@/app/(dashboard)/expedientes/actions";
import { toast } from "sonner";

type DocumentUploaderProps = {
  expedienteId: string;
};

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg,.docx";
const MAX_SIZE_MB = 10;

export const DocumentUploader = ({ expedienteId }: DocumentUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          role="button"
          tabIndex={0}
          aria-label="Arrastra o selecciona un archivo para subir"
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
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
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="mt-2 text-sm font-medium">
            {isUploading
              ? "Subiendo..."
              : "Arrastra un archivo o haz clic para seleccionar"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
};
