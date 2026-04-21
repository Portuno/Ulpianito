import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, MapPin, Sparkles, TrendingUp } from "lucide-react";

const IusPage = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Ius (IUS)</h1>
        <p className="text-muted-foreground">
          Moneda interna de Ulpianito para reconocer actividad, aprendizaje y
          calidad en la plataforma.
        </p>
        <p className="text-sm italic text-muted-foreground">
          En las ciencias jurídicas, un Ius es una unidad de transferencia del
          Derecho.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Coins className="h-5 w-5 text-primary" />
          <CardTitle>Qué son los IUS</CardTitle>
          <CardDescription>
            Unidad de cuenta dentro de Ulpianito, no es moneda fiduciaria.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Tu saldo se guarda en una billetera por usuario; cada movimiento
            queda registrado en un libro de auditoría (ledger) para
            transparencia y trazabilidad.
          </p>
          <p>
            Podés ver tu saldo en el encabezado y un resumen en el dashboard y
            en configuración.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Cómo conseguir IUS</CardTitle>
          <CardDescription>
            Recompensas ligadas a acciones concretas en la app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong className="font-medium text-foreground">Quizzes:</strong>{" "}
              aprobar un intento por encima del umbral configurado.
            </li>
            <li>
              <strong className="font-medium text-foreground">Misiones:</strong>{" "}
              completar extracción semántica, validación HITL, planificación y
              borrador, o la revisión de entrenamiento aprobada por admin.
            </li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="outline" size="sm">
              <Link href="/quizzes">Ir a Quizzes</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/misiones">Ir a Misiones Ius</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Usos actuales</CardTitle>
          <CardDescription>
            Gamificación y métricas dentro del producto.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Hoy los IUS sirven para reconocer progreso, comparar actividad y
            mantener motivación alineada con tareas reales (validación,
            aprendizaje, flujos asistidos por IA).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle>Roadmap</CardTitle>
          <CardDescription>
            Líneas de evolución previstas (sin fechas fijas).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-1">
            <li>Mayor transparencia de reglas y montos por tipo de acción.</li>
            <li>
              Usos adicionales dentro del producto (beneficios, canjes o
              privilegios) cuando el modelo económico esté definido.
            </li>
            <li>Integración con más rutas de aprendizaje y expedientes.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default IusPage;
