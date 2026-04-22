import Link from "next/link";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, Timer, Filter } from "lucide-react";

const getPriorityLabel = (score: number) => {
  if (score >= 400) return "Alta";
  if (score >= 200) return "Media";
  return "Baja";
};

const getAgingHours = (createdAt: string) =>
  Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));

const ValidacionPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ priority?: string; scope?: string }>;
}) => {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: queueRows } = await supabase
    .from("documentos")
    .select("id, nombre, created_at, uploaded_by, extraction_status, validado_at, expediente_id, expedientes(titulo)")
    .eq("extraction_status", "done")
    .is("validado_at", null)
    .order("created_at", { ascending: true })
    .limit(40);

  const queue = (queueRows ?? []).map((row) => {
    const agingHours = getAgingHours(row.created_at);
    const riskScore = row.nombre.toLowerCase().includes("contrato") ? 4 : 2;
    const urgencyScore = agingHours > 24 ? 4 : agingHours > 8 ? 3 : 2;
    const priorityScore = riskScore * 100 + urgencyScore * 10 + Math.min(agingHours, 9);
    const priority = getPriorityLabel(priorityScore);
    const assignedTo = row.uploaded_by === user?.id ? "Asignado a mí" : "Sin asignar";

    return {
      id: row.id,
      documento: row.nombre,
      expedienteId: row.expediente_id,
      expediente: (row.expedientes as { titulo?: string } | null)?.titulo ?? "Sin título",
      priority,
      priorityScore,
      agingHours,
      assignedTo,
      workflowState: "queued",
    };
  });

  const selectedPriority = resolvedSearchParams?.priority ?? "all";
  const selectedScope = resolvedSearchParams?.scope ?? "all";

  const filteredQueue = queue.filter((item) => {
    const priorityMatch =
      selectedPriority === "all" || item.priority.toLowerCase() === selectedPriority;
    const scopeMatch =
      selectedScope === "all" ||
      (selectedScope === "mine" && item.assignedTo === "Asignado a mí") ||
      (selectedScope === "unassigned" && item.assignedTo === "Sin asignar");

    return priorityMatch && scopeMatch;
  });

  const highPriority = queue.filter((item) => item.priority === "Alta").length;
  const mediumPriority = queue.filter((item) => item.priority === "Media").length;

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
          <CardHeader className="pb-2">
            <CardDescription>Alta prioridad</CardDescription>
            <CardTitle>{highPriority}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Prioridad media</CardDescription>
            <CardTitle>{mediumPriority}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En cola total</CardDescription>
            <CardTitle>{queue.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Cola operativa de validación
            </CardTitle>
            <CardDescription>
              Priorización por riesgo, urgencia y antigüedad para reducir incumplimientos de SLA.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant={selectedPriority === "all" ? "default" : "outline"}>
              <Link href="/validacion">Todas</Link>
            </Button>
            <Button asChild size="sm" variant={selectedPriority === "alta" ? "default" : "outline"}>
              <Link href="/validacion?priority=alta">Alta</Link>
            </Button>
            <Button asChild size="sm" variant={selectedScope === "mine" ? "default" : "outline"}>
              <Link href={`/validacion?priority=${selectedPriority}&scope=mine`}>
                Asignado a mí
              </Link>
            </Button>
            <Button asChild size="sm" variant={selectedScope === "unassigned" ? "default" : "outline"}>
              <Link href={`/validacion?priority=${selectedPriority}&scope=unassigned`}>
                Sin asignar
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Estado de workflow inicial: <Badge variant="outline">queued</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Expediente</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Antigüedad</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.documento}</TableCell>
                  <TableCell>{item.expediente}</TableCell>
                  <TableCell>
                    <Badge variant={item.priority === "Alta" ? "default" : "outline"}>
                      {item.priority} ({item.priorityScore})
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" />
                      {item.agingHours}h
                    </span>
                  </TableCell>
                  <TableCell>{item.assignedTo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.workflowState}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button size="sm" variant="outline">Tomar</Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/expedientes/${item.expedienteId}/documentos/${item.id}`}>
                          Revisar
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredQueue.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay ítems para los filtros actuales.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidacionPage;
