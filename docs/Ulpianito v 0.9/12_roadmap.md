# Ulpianito v0.9 - Roadmap de ejecucion

## Norte

Convertir la base funcional actual en operacion escalable y medible: mas activacion, mejor calidad de datos y menor tiempo de ciclo juridico.

## Fase 0-30 dias (P0)

- Cerrar flujo critico expediente -> documento -> extraccion -> validacion -> aplicacion.
- Implementar bandeja `/validacion` conectada a `validation_queue_items` y `claim_validation_queue_item`.
- Instrumentar eventos obligatorios en acciones de expedientes/misiones/quizzes.
- Alinear validaciones de auth UI/server para evitar inconsistencias.

### Metricas objetivo

- `>=35%` activacion 24h.
- `>=80%` cobertura de tracking en eventos obligatorios.
- `<15%` backlog vencido en validacion.

## Fase 31-60 dias (P1)

- Endurecer contratos y respuestas de edge functions (schema uniforme).
- Reducir fallback demo y subir precision de salida IA.
- Mejorar onboarding contextual y empty states accionables.
- Publicar tablero operativo minimo (errores, latencia, throughput, conversion de funnel).

### Metricas objetivo

- `-30%` tiempo upload -> validacion.
- `+20%` tasa de validacion en primera revision.
- `<2%` tasa de error de edge en rutas criticas.

## Fase 61-90 dias (P1/P2)

- Reglas de priorizacion avanzada para cola HITL (riesgo + urgencia + aging).
- Evolucion de quizzes (dificultad adaptativa y trazado por tema).
- Economia IUS con controles anti-abuso y reportes de salud.
- Consolidar playbook de release con pruebas automatizadas minimas.

### Metricas objetivo

- `+25%` frecuencia semanal activa.
- `>=90%` SLA de alta prioridad en validacion.
- `>=20%` mejora en pass rate de quizzes por cohortes.

## Dependencias clave

- SQL ya disponible:
  - `supabase/007_product_events_analytics.sql`
  - `supabase/008_validation_queue.sql`
  - `supabase/009_dedup_constraints_ai.sql`
- Backlog y runbooks existentes:
  - `docs/stabilization-backlog.md`
  - `docs/observability-runbook.md`
  - `docs/testing-and-release.md`
