# Observability and Incident Runbook

## Eventos minimos a loggear

- `auth.login.success|error`
- `expediente.create.success|error`
- `document.extract.start|success|error`
- `mission.step.<extract|hitl|planner|writer|training>.<success|error>`
- `quiz.attempt.submitted`
- `quiz.reward.claimed|error`

## Correlation keys

- `request_id`
- `run_id`
- `documento_id`
- `quiz_id`
- `profile_id`

## Alertas operativas

- Error rate edge > 5% en 15 min.
- 3 fallos consecutivos en una misma `run_id`.
- Recompensa rechazada por idempotencia repetida > umbral esperado.

## Procedimiento de incidente

1. Identificar flujo afectado y alcance (`run_id`/`documento_id`).
2. Revisar ultimo paso exitoso y primer error.
3. Confirmar si el estado de DB quedo inconsistente.
4. Reintentar paso seguro (solo si es idempotente).
5. Si no es seguro, abrir correccion manual y registrar postmortem.

## Rollback funcional

- Deshabilitar accion UI del flujo afectado.
- Mantener rutas read-only para que usuarios no pierdan visibilidad.
- Rehabilitar cuando QA smoke confirme recuperacion.
