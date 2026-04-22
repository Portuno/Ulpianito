# Ulpianito v0.9 - Modulos y funciones actuales

## 1) App shell y navegacion

- Modulo: Layout dashboard
  - Funciones: estructura visual, sidebar, topbar, contexto de usuario/saldo.
  - Evidencia: `app/(dashboard)/layout.tsx`, `components/layout/sidebar.tsx`, `components/layout/topbar.tsx`, `components/layout/ius-topbar-balance.tsx`.
  - Estado: `Operativo`.

## 2) Auth y perfiles

- Modulo: autenticacion y onboarding de usuario
  - Funciones: login, register, logout, resolucion de perfil/despacho, guards por rol.
  - Evidencia: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/(auth)/actions.ts`, `lib/auth/profile.ts`, `lib/auth/guards.ts`, `lib/auth/roles.ts`.
  - Estado: `Operativo`.

## 3) Expedientes

- Modulo: gestion de caso
  - Funciones: crear/listar/ver expediente, notas, sujetos, timeline.
  - Evidencia: `app/(dashboard)/expedientes/*`, `components/expedientes/*`, `lib/expediente-view-model.ts`.
  - Estado: `Operativo`.
- Modulo: documentos y extraccion
  - Funciones: upload/borrado, analisis IA, validacion y aplicacion.
  - Evidencia: `app/(dashboard)/expedientes/actions.ts`, `components/expedientes/document-detail-workspace.tsx`, `supabase/functions/document-extract-gemini/index.ts`.
  - Estado: `Operativo/Parcial` (depende de calidad del extractor).

## 4) Misiones IA

- Modulo: run de mision
  - Funciones: crear run, ejecutar pasos, registrar eventos, revision entrenamiento.
  - Evidencia: `app/(dashboard)/misiones/page.tsx`, `app/(dashboard)/misiones/runs/[id]/page.tsx`, `app/(dashboard)/misiones/actions.ts`, `components/missions/mission-run-wizard.tsx`.
  - Estado: `Operativo`.

## 5) Quizzes

- Modulo: aprendizaje evaluable
  - Funciones: draft de quiz, generacion de preguntas, render y envio de intento, scoring.
  - Evidencia: `app/(dashboard)/quizzes/*`, `app/(dashboard)/quizzes/actions.ts`, `components/quizzes/quiz-player.tsx`, `supabase/functions/ius-generate-quiz/index.ts`.
  - Estado: `Operativo`.

## 6) IUS economia

- Modulo: wallet + ledger
  - Funciones: saldo, movimientos, reglas de recompensa, claim idempotente.
  - Evidencia: `app/(dashboard)/ius/page.tsx`, `supabase/005_ius_gamification.sql`.
  - Estado: `Operativo`.

## 7) HITL validacion

- Modulo: revision humana
  - Funciones: validaciones embebidas en flujo documental/misiones.
  - Evidencia: `app/(dashboard)/expedientes/actions.ts`, `app/(dashboard)/misiones/actions.ts`.
  - Estado: `Operativo`.
- Modulo: bandeja de validacion
  - Funciones: cola priorizada, claim y SLA.
  - Evidencia: `supabase/008_validation_queue.sql`, `app/(dashboard)/validacion/page.tsx`.
  - Estado: `Parcial` (backend listo, UI incompleta).

## 8) Seguridad y datos

- Modulo: RLS y control multi-tenant
  - Funciones: politicas por despacho, helper de despacho, hardening.
  - Evidencia: `supabase/002_rls_policies.sql`, `supabase/010_security_hardening_checks.sql`.
  - Estado: `Operativo`.

## 9) Analytics de producto

- Modulo: eventos y telemetria
  - Funciones: `product_events` y `track_product_event`.
  - Evidencia: `supabase/007_product_events_analytics.sql`, `docs/product-audit/02_taxonomia_eventos_producto.md`.
  - Estado: `Parcial` (instrumentacion no completa en app).

## 10) Secciones informativas/no core

- Modulo: paginas no operativas completas
  - Funciones: placeholder o contenido informativo.
  - Evidencia: `app/(dashboard)/ingesta/page.tsx`, `agentes/page.tsx`, `academia/page.tsx`, `documentacion/page.tsx`, `directorio/page.tsx`.
  - Estado: `Parcial/Pendiente`.
