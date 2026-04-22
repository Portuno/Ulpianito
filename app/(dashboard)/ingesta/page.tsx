import Link from "next/link";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FolderKanban, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const IngestaPage = () => {
  const checklist = [
    "Nombre del archivo con prefijo de fecha (YYYY-MM-DD).",
    "Documento vinculado al expediente correcto.",
    "Formato legible y sin páginas faltantes.",
    "Metadatos mínimos completos para extracción.",
  ];

  const lotes = [
    { expediente: "Prop. intelectual", documentos: 5, estado: "en curso" },
    { expediente: "Contratos SaaS", documentos: 3, estado: "pendiente de revisión" },
    { expediente: "Laboral 2026", documentos: 2, estado: "listo para extracción" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2 pb-3">
            <UploadCloud className="h-5 w-5 text-primary" />
            <CardTitle>Acción principal de ingesta</CardTitle>
            <CardDescription>
              Cargá documentos y consolidá trazabilidad en un flujo de dos pasos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild>
              <Link href="/expedientes/nuevo">Crear expediente nuevo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/expedientes">Continuar expediente existente</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2 pb-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>Checklist antes de validar</CardTitle>
            <CardDescription>
              Evita retrabajo confirmando calidad mínima de carga.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            <CardTitle>Lotes activos de ingesta</CardTitle>
          </div>
          <CardDescription>
            Supervisá estado operativo sin abrir cada expediente por separado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expediente</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Estado de lote</TableHead>
                <TableHead className="text-right">Abrir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotes.map((lote) => (
                <TableRow key={lote.expediente}>
                  <TableCell className="font-medium">{lote.expediente}</TableCell>
                  <TableCell>{lote.documentos}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{lote.estado}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/expedientes">Ver expediente</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IngestaPage;
