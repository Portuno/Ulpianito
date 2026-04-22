# Ulpianito v0.9 - Misiones IA

## Alcance

Orquestacion de pasos IA y revision humana para generar salidas juridicas y aprendizaje continuo.

## Estado actual

- `Operativo`:
  - Crear `mission_run`.
  - Ejecutar extraccion y validacion inicial.
  - Registrar revision HITL.
  - Ejecutar planner y writer.
  - Revisar entrenamiento (admin).
  - Registrar eventos por paso y recompensas IUS.
- `Parcial`:
  - Calidad de salida depende de edge functions con componentes demo/fallback.

## Evidencia en codigo

- Paginas:
  - `app/(dashboard)/misiones/page.tsx`
  - `app/(dashboard)/misiones/runs/[id]/page.tsx`
- Acciones:
  - `app/(dashboard)/misiones/actions.ts`
- UI:
  - `components/missions/mission-run-wizard.tsx`

## Datos y SQL asociados

- Gamificacion y wallet: `supabase/005_ius_gamification.sql`
- Cola de validacion relacionada: `supabase/008_validation_queue.sql`

## Dependencias edge

- `supabase/functions/extractor-ius-basic/index.ts`
- `supabase/functions/validator-ius-entities/index.ts`
- `supabase/functions/planner-ius/index.ts`
- `supabase/functions/writer-ius-document/index.ts`

## Brechas y prioridades

- `P0`: cerrar trazabilidad y errores por paso para evitar runs en estado ambiguo.
- `P1`: elevar calidad semantica de salidas (menos demo, mas contexto juridico real).
- `P1`: definir KPIs de throughput, retry y precision por etapa.
