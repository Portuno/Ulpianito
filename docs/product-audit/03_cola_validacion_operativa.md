# Cola de Validacion Operativa (HITL)

## Objetivo

Convertir `/validacion` en una bandeja operativa real con priorizacion por riesgo, urgencia y antiguedad.

## Definicion de item en cola

Un item es un `documento` que:

- Tiene `extraction_status = 'done'`.
- Tiene `extraction_report` no nulo.
- No fue validado (`validado_at is null`).

## Priorizacion recomendada

`priority_score = risk_score * 100 + urgency_score * 10 + aging_score`

- `risk_score` (0-5): tipo de documento sensible, montos altos, incertidumbre del extractor.
- `urgency_score` (0-5): cercania a `fecha_vencimiento` (si aplica por evento asociado).
- `aging_score` (0-9): horas en cola (mas viejo, mas prioridad).

## Estados de workflow

- `queued`: listo para revisar.
- `in_review`: tomado por un revisor.
- `blocked`: falta contexto o documento ilegible.
- `done`: validacion aplicada.
- `cancelled`: descartado por duplicado/no relevante.

## SLA inicial sugerido

- Alta prioridad (`priority_score >= 400`): <= 4 horas.
- Media prioridad (`200-399`): <= 24 horas.
- Baja prioridad (`< 200`): <= 72 horas.

## Pantalla `/validacion` (MVP funcional)

- Tabla con columnas:
  - Documento
  - Expediente
  - Prioridad
  - Antiguedad
  - Asignado a
  - Estado
  - Acciones (`Tomar`, `Abrir`, `Reasignar`)
- Filtros:
  - Estado
  - Prioridad
  - Asignado a mi / sin asignar
  - Despacho

## Integracion backend

- Lectura principal desde `public.validation_queue_items` (view).
- Asignacion con `public.claim_validation_queue_item`.
- Cierre de item al validar extraccion (`validateDocumentExtraction`) o aplicar cambios.

## Telemetria minima

- `validation.queue_item_claimed`
- `validation.queue_item_completed`
- `validation.queue_item_reassigned`
- `validation.queue_sla_breached`
