import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ScrollText, ClipboardList } from "lucide-react";

const DocumentacionPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documentacion</h1>
        <p className="text-muted-foreground">
          Base operativa para procesos, politicas y criterios de calidad.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Guias de uso</CardTitle>
            <CardDescription>
              Manuales internos para operacion diaria en Ulpianito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Documenta flujo ideal desde ingesta hasta aprobacion final.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle>Checklists</CardTitle>
            <CardDescription>
              Controles de calidad por etapa para reducir errores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/revisiones">Ver revisiones</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <ScrollText className="h-5 w-5 text-primary" />
            <CardTitle>Notas tecnicas</CardTitle>
            <CardDescription>
              Decisiones de implementacion y cambios de arquitectura.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consolida supuestos funcionales para mantener coherencia del producto.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentacionPage;
