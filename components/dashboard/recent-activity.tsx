import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type RecentActivityProps = {
  cases: {
    id: string;
    titulo: string;
    estado: string;
    updated_at: string;
    owner: string;
    dueDate: string | null;
  }[];
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const RecentActivity = ({ cases }: RecentActivityProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actividad operativa reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {cases.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay casos activos para mostrar.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último cambio</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Vence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((expediente) => (
                <TableRow key={expediente.id}>
                  <TableCell className="font-medium">
                    <Link href={`/expedientes/${expediente.id}`} className="hover:underline">
                      {expediente.titulo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expediente.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(expediente.updated_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {expediente.owner}
                  </TableCell>
                  <TableCell className="text-sm">
                    {expediente.dueDate ? formatDate(expediente.dueDate) : "Sin plazo"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
