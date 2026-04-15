"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { updateExpedienteNotes } from "@/app/(dashboard)/expedientes/actions";
import { toast } from "sonner";
import type { Expediente } from "@/lib/types/database";

type MiscelaneoTabProps = {
  expediente: Expediente;
};

export const MiscelaneoTab = ({ expediente }: MiscelaneoTabProps) => {
  const [notas, setNotas] = useState(expediente.notas ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateExpedienteNotes(expediente.id, notas);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Notas guardadas");
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Información del expediente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Creado
              </dt>
              <dd className="text-sm">
                {new Date(expediente.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Última actualización
              </dt>
              <dd className="text-sm">
                {new Date(expediente.updated_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Tipo
              </dt>
              <dd className="text-sm">{expediente.tipo}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Estado
              </dt>
              <dd className="text-sm">{expediente.estado}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Notas</CardTitle>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Guardar notas"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar
          </Button>
        </CardHeader>
        <CardContent>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={8}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Escribe notas sobre este expediente..."
            aria-label="Notas del expediente"
          />
        </CardContent>
      </Card>
    </div>
  );
};
