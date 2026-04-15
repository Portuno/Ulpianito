"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Trash2, Users } from "lucide-react";
import {
  createSujeto,
  deleteSujeto,
  type ExpedienteState,
} from "@/app/(dashboard)/expedientes/actions";
import { toast } from "sonner";
import type { Sujeto } from "@/lib/types/database";

type SujetosTabProps = {
  expedienteId: string;
  sujetos: Sujeto[];
};

const initialState: ExpedienteState = { error: null };

export const SujetosTab = ({ expedienteId, sujetos }: SujetosTabProps) => {
  const [state, formAction, isPending] = useActionState(
    createSujeto,
    initialState
  );

  const handleDelete = async (sujetoId: string) => {
    if (!confirm("¿Eliminar este sujeto?")) return;
    await deleteSujeto(sujetoId, expedienteId);
    toast.success("Sujeto eliminado");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Partes involucradas</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
              Añadir sujeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo sujeto</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <input
                type="hidden"
                name="expediente_id"
                value={expedienteId}
              />

              {state.error && (
                <div
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                  role="alert"
                >
                  {state.error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sujeto_nombre">Nombre completo</Label>
                <Input id="sujeto_nombre" name="nombre" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol_procesal">Rol procesal</Label>
                <Input
                  id="rol_procesal"
                  name="rol_procesal"
                  placeholder="ej. Demandante, Demandado, Testigo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sujeto_dni">DNI / NIF (opcional)</Label>
                <Input id="sujeto_dni" name="dni" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sujeto_contacto">Contacto (opcional)</Label>
                <Input
                  id="sujeto_contacto"
                  name="contacto"
                  placeholder="Email o teléfono"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Añadiendo..." : "Añadir sujeto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sujetos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No hay sujetos registrados
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sujetos.map((sujeto) => (
                  <TableRow key={sujeto.id}>
                    <TableCell className="font-medium">
                      {sujeto.nombre}
                    </TableCell>
                    <TableCell>{sujeto.rol_procesal}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {sujeto.dni ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sujeto.contacto ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ${sujeto.nombre}`}
                        onClick={() => handleDelete(sujeto.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
