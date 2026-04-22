"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePerfil, type PerfilState } from "@/app/(dashboard)/perfil/actions";

type ProfileFormProps = {
  nombre: string;
  apellido: string;
  email: string;
  despachoNombre: string;
};

const initialState: PerfilState = { error: null, success: null };

export const ProfileForm = ({
  nombre,
  apellido,
  email,
  despachoNombre,
}: ProfileFormProps) => {
  const [state, formAction, isPending] = useActionState(updatePerfil, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del usuario</CardTitle>
        <CardDescription>
          Edita tu información para mantener actualizado tu perfil operativo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state.error && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          {state.success && (
            <p className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700" role="status">
              {state.success}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" defaultValue={nombre} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" name="apellido" defaultValue={apellido} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email de acceso</Label>
            <Input id="email" value={email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre_despacho">Nombre del despacho</Label>
            <Input
              id="nombre_despacho"
              name="nombre_despacho"
              defaultValue={despachoNombre}
              placeholder="Nombre de tu despacho"
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
