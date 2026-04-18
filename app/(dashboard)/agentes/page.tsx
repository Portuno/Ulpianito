import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Workflow, Sparkles } from "lucide-react";

const AgentesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Flujos IA</h1>
        <p className="text-muted-foreground">
          Orquesta procesos de extraccion, validacion y redaccion asistida.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-2">
            <Workflow className="h-5 w-5 text-primary" />
            <CardTitle>Pipeline juridico</CardTitle>
            <CardDescription>
              Encadena tareas por expediente con checkpoints manuales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/misiones">Gestionar misiones</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Automatizacion</CardTitle>
            <CardDescription>
              Define gatillos y reglas para acelerar tareas repetitivas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consejo: activar automatizaciones por etapas para auditar impacto.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Experimentacion</CardTitle>
            <CardDescription>
              Prueba prompts y variantes de flujo sin afectar produccion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/quizzes">Abrir Quizzes IA</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentesPage;
