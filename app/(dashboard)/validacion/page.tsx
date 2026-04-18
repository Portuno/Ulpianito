import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ListChecks, History } from "lucide-react";

const ValidacionPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Validacion (HITL)</h1>
        <p className="text-muted-foreground">
          Supervisa y corrige resultados de IA antes de publicarlos al equipo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Cola de revision</CardTitle>
            <CardDescription>
              Prioriza documentos pendientes por riesgo, urgencia y cliente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/revisiones">Abrir revisiones</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <CardTitle>Criterios de calidad</CardTitle>
            <CardDescription>
              Verifica entidades, citas, fechas y consistencia del caso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Usa reglas claras por tipo de documento para reducir retrabajo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>
              Mantiene un historial explicable de correcciones humanas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cada cambio aprobado alimenta mejores prompts y nuevos controles.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValidacionPage;
