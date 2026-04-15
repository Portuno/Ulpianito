import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt } from "lucide-react";
import type { Factura } from "@/lib/types/database";

type PatrimonialTabProps = {
  facturas: Factura[];
};

const ESTADO_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  validada: "default",
  pendiente: "secondary",
  rechazada: "destructive",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

export const PatrimonialTab = ({ facturas }: PatrimonialTabProps) => {
  const totalBase = facturas.reduce(
    (sum, f) => sum + Number(f.base_imponible),
    0
  );
  const totalIVA = facturas.reduce((sum, f) => sum + Number(f.iva), 0);
  const totalGeneral = facturas.reduce((sum, f) => sum + Number(f.total), 0);

  if (facturas.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No hay facturas registradas
          </p>
          <p className="text-xs text-muted-foreground">
            Las facturas se crearán cuando se active la extracción por IA
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Base Imponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBase)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              IVA Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalIVA)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(totalGeneral)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Facturas ({facturas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Factura</TableHead>
                <TableHead>Emisor</TableHead>
                <TableHead>Receptor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturas.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell className="font-mono text-sm">
                    {factura.numero_factura}
                  </TableCell>
                  <TableCell>{factura.emisor}</TableCell>
                  <TableCell>{factura.receptor}</TableCell>
                  <TableCell>
                    {new Date(factura.fecha).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(factura.total))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ESTADO_VARIANT[factura.estado_validacion] ?? "outline"
                      }
                    >
                      {factura.estado_validacion}
                    </Badge>
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
