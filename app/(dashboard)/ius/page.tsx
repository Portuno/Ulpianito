import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Coins, MapPin, Sparkles, TrendingUp, Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const IusPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: wallet }, { data: ledger }] = await Promise.all([
    supabase.from("ius_wallets").select("balance").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("ius_ledger")
      .select("id, delta, reason, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const balance = wallet?.balance ?? 0;
  const currentLevel =
    balance >= 150 ? "Estratega" : balance >= 80 ? "Analista" : "Amanuense";

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
          <Trophy className="h-5 w-5 text-primary" />
          <CardTitle>Tu progreso actual</CardTitle>
          <CardDescription>
            Recompensa tangible por práctica, calidad y consistencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Saldo IUS</p>
            <p className="text-3xl font-semibold">{balance}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Nivel actual</p>
            <p className="text-xl font-semibold">{currentLevel}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Próximo objetivo</p>
            <p className="text-sm font-medium">
              {balance >= 150 ? "Mantener consistencia semanal" : "Completar misión + quiz aprobado"}
            </p>
          </div>
        </CardContent>
      </Card>

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
          <CardTitle>Movimientos recientes</CardTitle>
          <CardDescription>
            Cada acción premiada queda auditada en el ledger personal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Delta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(ledger ?? []).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell>{entry.reason}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={entry.delta > 0 ? "default" : "secondary"}>
                      {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(ledger ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Aún no hay movimientos. Completa un quiz o una misión para activar tu progreso.
            </p>
          ) : null}
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
