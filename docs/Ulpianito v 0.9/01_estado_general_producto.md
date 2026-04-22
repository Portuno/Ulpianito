# Ulpianito v0.9 - Estado general del producto

## Resumen ejecutivo

Ulpianito tiene una base funcional solida para expedientes, misiones IA, quizzes e incentivos IUS, con seguridad multi-tenant por despacho y artefactos de estabilizacion ya documentados. El principal gap no es de arquitectura, sino de cierre operativo en validacion HITL, instrumentacion de eventos y profundidad de algunos modulos de negocio.

## Alcance implementado hoy

- `Operativo`: auth (login/register), expedientes, documentos, extraccion IA por documento, misiones con pasos, quizzes con scoring e incentivos IUS, dashboard base.
- `Parcial`: validacion HITL como experiencia operativa completa, analytics de producto en app, onboarding contextual, algunas secciones de sidebar con enfoque informativo.
- `Pendiente`: evolucion de edge functions desde respuestas demo/fallback a capacidades productivas con LLM y controles avanzados.

## Evidencia tecnica principal

- Frontend App Router: `app/(dashboard)`, `app/(auth)`.
- Componentes de dominio: `components/expedientes`, `components/missions`, `components/quizzes`, `components/layout`.
- Logica de servidor: `app/(dashboard)/*/actions.ts`.
- SQL versionado: `supabase/001_initial_schema.sql` a `supabase/010_security_hardening_checks.sql`.
- Funciones edge: `supabase/functions/*`.

## Fortalezas actuales

- Arquitectura por dominios clara (expedientes/misiones/quizzes/ius).
- Seguridad por RLS y helpers de despacho/rol.
- Modelo de datos rico para expansion (expedientes 360, ledger IUS, cola de validacion, eventos de producto).
- Documentacion operativa existente de seguridad, observabilidad y testing.

## Brechas de mayor impacto

1. `P0` Validacion operativa en UI:
   - Existe backend (`supabase/008_validation_queue.sql`) pero `/validacion` aun es mayormente informativo.
2. `P1` Telemetria de producto:
   - Existe esquema de eventos (`supabase/007_product_events_analytics.sql`) sin cobertura sistematica en acciones criticas.
3. `P1` Cierre de flujos IA:
   - Varias edge functions trabajan con salida demo/fallback.
4. `P2` Experiencia de activacion:
   - Onboarding y empty states contextuales aun sin cierre transversal.

## Riesgos operativos

- Dificultad para medir ROI de IA sin tracking consistente.
- Cuellos de botella de revision manual sin bandeja HITL ejecutable.
- Percepcion de "modulo incompleto" por secciones informativas en sidebar.

## Referencias documentales previas

- `docs/plan-integral-implementacion.md`
- `docs/stabilization-backlog.md`
- `docs/security-rls-audit.md`
- `docs/observability-runbook.md`
- `docs/testing-and-release.md`
- `docs/product-audit/01_onboarding_y_empty_states.md`
- `docs/product-audit/02_taxonomia_eventos_producto.md`
- `docs/product-audit/03_cola_validacion_operativa.md`
- `docs/product-audit/04_deduplicacion_idempotencia.md`
- `docs/product-audit/05_roadmap_30_60_90.md`
