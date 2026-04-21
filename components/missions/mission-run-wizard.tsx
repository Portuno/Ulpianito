"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { MissionRun, MissionStepEvent } from "@/lib/types/database";
import {
  runExtractionAndValidation,
  submitHitlReview,
  runPlannerStep,
  runWriterStep,
  submitTrainingReview,
  type HitlPayload,
  type TrainingPayload,
} from "@/app/(dashboard)/misiones/actions";

type MissionRunWizardProps = {
  run: MissionRun;
  events: MissionStepEvent[];
  missionTitle: string;
  isAdmin: boolean;
};

const StepBadge = ({ step }: { step: string }) => (
  <Badge variant="secondary" className="font-mono text-xs">
    {step}
  </Badge>
);

export const MissionRunWizard = ({
  run,
  events,
  missionTitle,
  isAdmin,
}: MissionRunWizardProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [licensorLabel, setLicensorLabel] = useState("");
  const [companyLabel, setCompanyLabel] = useState("");
  const [riskAck, setRiskAck] = useState(false);
  const [econNotes, setEconNotes] = useState("");
  const [hitlNotes, setHitlNotes] = useState("");

  const [trapUnderstood, setTrapUnderstood] = useState(false);
  const [trainingComments, setTrainingComments] = useState("");

  const extractorOut = run.extractor_output as Record<string, unknown> | null;
  const validatorOut = run.validator_output as Record<string, unknown> | null;
  const plannerOut = run.planner_output as Record<string, unknown> | null;
  const writerOut = run.writer_output as Record<string, unknown> | null;

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [events]
  );

  const handleRunExtract = () => {
    setError(null);
    startTransition(async () => {
      const res = await runExtractionAndValidation(run.id);
      if (res.error) {
        setError(res.error);
      }
    });
  };

  const handleHitl = () => {
    setError(null);
    if (!licensorLabel.trim() || !companyLabel.trim()) {
      setError("Asigná nombres reales a Licensor y Company.");
      return;
    }
    if (!riskAck) {
      setError("Debés confirmar la lectura del riesgo económico.");
      return;
    }
    const payload: HitlPayload = {
      licensorLabel: licensorLabel.trim(),
      companyLabel: companyLabel.trim(),
      riskAcknowledged: riskAck,
      economicAlertNotes: econNotes,
      notes: hitlNotes,
    };
    startTransition(async () => {
      const res = await submitHitlReview(run.id, payload);
      if (res.error) {
        setError(res.error);
      }
    });
  };

  const handlePlanner = () => {
    setError(null);
    startTransition(async () => {
      const res = await runPlannerStep(run.id);
      if (res.error) {
        setError(res.error);
      }
    });
  };

  const handleWriter = () => {
    setError(null);
    startTransition(async () => {
      const res = await runWriterStep(run.id);
      if (res.error) {
        setError(res.error);
      }
    });
  };

  const handleTraining = (status: TrainingPayload["status"]) => {
    setError(null);
    const payload: TrainingPayload = {
      understoodSublicenseTrap: trapUnderstood,
      comments: trainingComments,
      status,
    };
    startTransition(async () => {
      const res = await submitTrainingReview(run.id, payload);
      if (res.error) {
        setError(res.error);
      }
    });
  };

  const showDraft = run.status === "draft";
  const showHitl = run.status === "needs_human";
  const showPlanner =
    run.status === "running" &&
    run.current_step === "plan_write" &&
    !plannerOut;
  const showWriter =
    run.status === "running" &&
    run.current_step === "plan_write" &&
    plannerOut &&
    !writerOut;
  const showTraining =
    run.status === "training_pending" && isAdmin && writerOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{missionTitle}</h1>
        <p className="text-muted-foreground">
          Ejecución gamificada Ius · Estado:{" "}
          <span className="font-medium text-foreground">{run.status}</span>{" "}
          <StepBadge step={run.current_step} />
        </p>
      </div>

      {error && (
        <div
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Progreso y logs</CardTitle>
          <CardDescription>
            Mensajes del flujo (extracción, validación, revisión).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={
              run.status === "training_done"
                ? 100
                : run.status === "training_pending"
                  ? 85
                  : run.status === "needs_human"
                    ? 40
                    : 20
            }
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${
                  run.status === "training_done"
                    ? 100
                    : run.status === "training_pending"
                      ? 85
                      : run.status === "needs_human"
                        ? 40
                        : 20
                }%`,
              }}
            />
          </div>
          <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
            {sortedEvents.length === 0 && (
              <li className="text-muted-foreground">Sin eventos aún.</li>
            )}
            {sortedEvents.map((ev) => (
              <li key={ev.id} className="flex flex-col gap-0.5 border-b border-border/60 pb-2 last:border-0">
                <span className="text-xs text-muted-foreground">
                  {new Date(ev.created_at).toLocaleString()} · {ev.step_key}
                </span>
                <span>{ev.message}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {showDraft && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 1 · Extracción semántica</CardTitle>
            <CardDescription>
              Iniciá el agente extractor y el validador. Verás logs en tiempo
              real.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={handleRunExtract}
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? "Procesando…" : "Iniciar extracción y validación"}
            </Button>
          </CardContent>
        </Card>
      )}

      {extractorOut && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado extracción</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(extractorOut, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {showHitl && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 2 · Validación de entidades (HITL)</CardTitle>
            <CardDescription>
              Reemplazá las etiquetas genéricas y confirmá el riesgo económico.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validatorOut && (
              <div
                className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
                role="status"
              >
                <p className="font-medium text-amber-900 dark:text-amber-200">
                  Alerta
                </p>
                <p className="text-muted-foreground">
                  {String(validatorOut.economic_risk_summary ?? "")}
                </p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="licensor">Nombre real (Licensor)</Label>
                <Input
                  id="licensor"
                  value={licensorLabel}
                  onChange={(e) => setLicensorLabel(e.target.value)}
                  placeholder="Tu nombre o cliente"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Nombre real (Company / Partner)</Label>
                <Input
                  id="company"
                  value={companyLabel}
                  onChange={(e) => setCompanyLabel(e.target.value)}
                  placeholder="Contraparte"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="risk"
                type="checkbox"
                checked={riskAck}
                onChange={(e) => setRiskAck(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="risk" className="cursor-pointer font-normal">
                Confirmo haber leído y validado la alerta de incoherencia
                económica y los riesgos asociados.
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="econ">Notas sobre el riesgo (opcional)</Label>
              <Input
                id="econ"
                value={econNotes}
                onChange={(e) => setEconNotes(e.target.value)}
                placeholder="Observaciones para auditoría"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hitl-notes">Notas generales (opcional)</Label>
              <Input
                id="hitl-notes"
                value={hitlNotes}
                onChange={(e) => setHitlNotes(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={handleHitl}
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? "…" : "Aprobar y continuar"}
            </Button>
          </CardContent>
        </Card>
      )}

      {plannerOut && (
        <Card>
          <CardHeader>
            <CardTitle>Planificación (DaaS)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(plannerOut, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {writerOut && (
        <Card>
          <CardHeader>
            <CardTitle>Borrador de negociación</CardTitle>
            <CardDescription>
              No se envía: solo entrenamiento y revisión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
              {String(writerOut.draft ?? writerOut)}
            </pre>
          </CardContent>
        </Card>
      )}

      {showPlanner && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 3a · Planificación</CardTitle>
            <CardDescription>
              Invocar al agente planner-ius (contraoferta DaaS).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={handlePlanner}
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? "…" : "Generar plan"}
            </Button>
          </CardContent>
        </Card>
      )}

      {showWriter && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 3b · Redacción</CardTitle>
            <CardDescription>
              Borrador del correo vía writer-ius-document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={handleWriter}
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? "…" : "Generar borrador"}
            </Button>
          </CardContent>
        </Card>
      )}

      {run.status === "training_pending" && !isAdmin && writerOut && (
        <Card>
          <CardHeader>
            <CardTitle>Revisión de entrenamiento</CardTitle>
            <CardDescription>
              Un administrador revisará tu ejecución y dejará feedback
              pedagógico.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {showTraining && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 4 · Feedback del mentor (ADMIN)</CardTitle>
            <CardDescription>
              Evaluá si el alumno interpretó la trampa de sublicencias y dejá
              comentarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="trap"
                type="checkbox"
                checked={trapUnderstood}
                onChange={(e) => setTrapUnderstood(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="trap" className="cursor-pointer font-normal">
                El alumno interpretó adecuadamente el riesgo de sublicencias /
                datos personales
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tcomments">Comentarios pedagógicos</Label>
              <Input
                id="tcomments"
                value={trainingComments}
                onChange={(e) => setTrainingComments(e.target.value)}
                placeholder="Feedback cualitativo"
              />
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => handleTraining("approved")}
                disabled={isPending}
                aria-busy={isPending}
              >
                Aprobar
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleTraining("needs_work")}
                disabled={isPending}
                aria-busy={isPending}
              >
                Necesita trabajo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {run.status === "training_done" && (
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          Misión completada. IUS acreditados según reglas.
        </p>
      )}
    </div>
  );
};
