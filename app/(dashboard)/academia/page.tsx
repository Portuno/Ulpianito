import Link from "next/link";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpenCheck, BrainCircuit, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AcademiaPage = () => {
  const learningPath = [
    { etapa: "Amanuense", foco: "Extracción y verificación básica", salida: "1 misión completada" },
    { etapa: "Analista", foco: "HITL con criterios de calidad", salida: "2 validaciones aprobadas" },
    { etapa: "Estratega", foco: "Revisión final y argumentación", salida: "Quiz >= 80%" },
  ];

  const sessions = [
    { actividad: "Misión práctica: licencia y contratos", duracion: "15 min", destino: "/misiones" },
    { actividad: "Quiz adaptativo de documentación", duracion: "8 min", destino: "/quizzes" },
    { actividad: "Repaso de fundamentos HITL", duracion: "6 min", destino: "/documentacion" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academia Ulpianito</h1>
        <p className="text-muted-foreground">
          Entrenamiento continuo en practica juridica asistida por IA.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2 pb-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle>Ruta de progresión por rol</CardTitle>
            <CardDescription>
              Aprendé haciendo: misión real + revisión + evaluación corta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Foco</TableHead>
                  <TableHead>Meta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learningPath.map((item) => (
                  <TableRow key={item.etapa}>
                    <TableCell className="font-medium">{item.etapa}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.foco}</TableCell>
                    <TableCell>{item.salida}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2 pb-3">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            <CardTitle>Sprint de práctica de hoy</CardTitle>
            <CardDescription>
              Secuencia recomendada para avanzar sin fricción.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((session, index) => (
              <div key={session.actividad} className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Paso {index + 1}</p>
                <p className="text-sm font-medium">{session.actividad}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{session.duracion}</span>
                  <Button size="sm" variant={index === 0 ? "default" : "outline"} asChild>
                    <Link href={session.destino}>Iniciar</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <CardTitle>Criterio de aprobación</CardTitle>
          <CardDescription>
            Completa misión, valida con calidad y cierra con quiz para sumar IUS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Finaliza al menos 1 misión por semana.
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Logra 80% o más en quizzes de la práctica.
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Registra correcciones HITL sin retrabajo crítico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademiaPage;
