import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FolderKanban, FileText } from "lucide-react";

const IngestaPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-2">
            <UploadCloud className="h-5 w-5 text-primary" />
            <CardTitle>Subida inicial</CardTitle>
            <CardDescription>
              Cargá documentos al expediente y mantené trazabilidad por caso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/expedientes/nuevo">Crear expediente</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            <CardTitle>Gestión de lote</CardTitle>
            <CardDescription>
              Revisá expedientes activos y su estado de procesamiento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/expedientes">Ver expedientes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Checklist operativo</CardTitle>
            <CardDescription>
              Confirmá formato, metadatos y adjuntos antes de validar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sugerencia: cargar por carpeta del caso y nombrar archivos con
              prefijo de fecha para acelerar búsquedas posteriores.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IngestaPage;
