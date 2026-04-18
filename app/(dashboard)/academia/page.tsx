import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpenCheck, BrainCircuit } from "lucide-react";

const AcademiaPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academia Ulpianito</h1>
        <p className="text-muted-foreground">
          Entrenamiento continuo en practica juridica asistida por IA.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle>Rutas de aprendizaje</CardTitle>
            <CardDescription>
              Planes por rol para acelerar adopcion con criterio juridico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Incluye fundamentos de prompting, validacion y trazabilidad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            <CardTitle>Practicas guiadas</CardTitle>
            <CardDescription>
              Ejercicios con casos reales anonimizados y retroalimentacion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/misiones">Ir a Misiones Ius</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle>Evaluacion</CardTitle>
            <CardDescription>
              Medi progreso con quizzes adaptativos y recompensas IUS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/quizzes">Abrir Quizzes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademiaPage;
