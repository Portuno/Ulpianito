# Ulpianito v0.9 - Analytics, eventos y KPIs

## Alcance

Medicion de activacion, calidad operativa y engagement para gestionar producto con evidencia.

## Estado actual

- `Operativo en datos`:
  - Tabla de eventos y funcion de tracking en `supabase/007_product_events_analytics.sql`.
  - Taxonomia definida en `docs/product-audit/02_taxonomia_eventos_producto.md`.
- `Parcial en app`:
  - Falta cobertura sistematica de instrumentacion en acciones criticas.

## Eventos obligatorios (resumen)

- Activacion:
  - `expediente.created`
  - `documento.uploaded`
  - `documento.extraction_completed`
  - `documento.extraction_validated`
- Misiones:
  - `mission_run.created`
  - `mission_run.hitl_submitted`
  - `mission_run.writer_completed`
- Quizzes:
  - `quiz.created`
  - `quiz.questions_generated`
  - `quiz.attempt_submitted`
  - `quiz.attempt_passed|failed`

## KPIs sugeridos v0.9

- `% activacion_24h`: usuarios con expediente y documento en 24h.
- `% completion_extraccion`: extraction_completed sobre uploaded.
- `% validacion`: extraction_validated sobre extraction_completed.
- `SLA_hitl`: porcentaje de items dentro de SLA.
- `% quiz_pass_rate`: aprobacion de intentos por despacho y tema.

## Prioridades

- `P0`: instrumentar acciones server de expedientes/misiones/quizzes.
- `P1`: tablero operativo con cortes por despacho, rol y semana.
- `P2`: alertas automaticas por caida de conversion en funnel.
