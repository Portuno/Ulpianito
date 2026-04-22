"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createExpediente,
  type ExpedienteState,
} from "@/app/(dashboard)/expedientes/actions";

const TIPO_OPTIONS = [
  { value: "facturacion", label: "Facturación" },
  { value: "herencias", label: "Herencias" },
  { value: "propiedad_intelectual", label: "Propiedad Intelectual" },
  { value: "inmobiliario", label: "Inmobiliario" },
  { value: "corporativo", label: "Corporativo" },
  { value: "laboral", label: "Laboral / Administrativo" },
];

const initialState: ExpedienteState = { error: null };

type ExpedienteFormProps = {
  inline?: boolean;
  onCreated?: (expedienteId: string) => void;
};

export const ExpedienteForm = ({ inline = false, onCreated }: ExpedienteFormProps) => {
  const [state, formAction, isPending] = useActionState(
    createExpediente,
    initialState
  );

  useEffect(() => {
    if (!state.createdId || !inline) return;
    onCreated?.(state.createdId);
  }, [inline, onCreated, state.createdId]);

  return (
    <form action={formAction} className="space-y-4">
      {inline ? <input type="hidden" name="creation_mode" value="inline_sheet" /> : null}
      {state.error && (
        <div
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="titulo">Título del Expediente</Label>
        <Input
          id="titulo"
          name="titulo"
          placeholder="ej. Facturación Q1 2025"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numero_expediente">Número de Expediente</Label>
        <Input
          id="numero_expediente"
          name="numero_expediente"
          placeholder="ej. EXP-2025-001"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo / Especialidad</Label>
        <select
          id="tipo"
          name="tipo"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          defaultValue="facturacion"
          required
          aria-label="Tipo de expediente"
        >
          {TIPO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Descripción del expediente..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creando..." : "Crear Expediente"}
      </Button>
    </form>
  );
};
