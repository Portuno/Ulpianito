# Ulpianito v0.9 - HITL y validacion

## Alcance

Asegurar control humano sobre extracciones IA y decisiones de alto impacto mediante cola priorizada y SLA.

## Estado actual

- `Operativo`:
  - Validacion manual de extraccion desde detalle de documento.
  - Registro de revisiones en flujo de misiones.
- `Parcial`:
  - Ruta `/validacion` no opera aun como bandeja completa con asignacion/SLA en produccion.
- `Listo en backend`:
  - Estructura de cola y RPC de claim en SQL.

## Evidencia en codigo/SQL

- UI informativa: `app/(dashboard)/validacion/page.tsx`
- Acciones relacionadas: `app/(dashboard)/expedientes/actions.ts`, `app/(dashboard)/misiones/actions.ts`
- Cola de validacion: `supabase/008_validation_queue.sql`
- Diseno operativo previo: `docs/product-audit/03_cola_validacion_operativa.md`

## Flujo objetivo recomendado

1. Documento extraido entra a `queued`.
2. Revisor toma item (`claim_validation_queue_item`).
3. Revisor valida/corrige y aplica cambios.
4. Item se cierra (`done`) con telemetria y tiempos.

## KPIs operativos

- `Tiempo medio` upload -> validacion.
- `% SLA cumplido` por prioridad.
- `Backlog vencido`.
- `% retrabajo` por correccion posterior.

## Prioridades

- `P0`: implementar bandeja operativa en `/validacion` consumiendo la view `validation_queue_items`.
- `P1`: asignacion automatica por carga y especialidad.
- `P2`: reglas de prioridad avanzadas por riesgo documental.
