# Stabilization Backlog (P0/P1)

## P0 - Bloqueantes funcionales

- **Auth input validation**: `login/register` aceptan campos vacios y dependen del error de Supabase.
  - Archivos: `app/(auth)/actions.ts`
  - Criterio: early-return con mensajes claros para email/password invalidos.

- **Mission edge failure handling**: pasos de mision pueden romper render cuando falla una edge function.
  - Archivos: `app/(dashboard)/misiones/actions.ts`
  - Criterio: todos los pasos envuelven `invokeEdgeFunction` en `try/catch` y devuelven `ActionState`.

- **Quiz attempt integrity**: `submitQuizAttempt` no valida quiz sin preguntas ni indices fuera de rango.
  - Archivos: `app/(dashboard)/quizzes/actions.ts`, `components/quizzes/quiz-player.tsx`
  - Criterio: validar payload antes de insertar intento y bloquear submit duplicado desde UI.

- **Unsafe edge invocation config**: invocacion edge no valida URL/API key y no tiene timeout.
  - Archivos: `lib/ius/edge-invoke.ts`
  - Criterio: guard clauses para env y `AbortController` con timeout.

## P1 - Robustez y operacion

- **Delete operations without error path**: borrado de sujeto/documento ignora errores de DB/storage.
  - Archivos: `app/(dashboard)/expedientes/actions.ts`
  - Criterio: respuesta tipada con error y mensaje accionable.

- **Accesibilidad controles custom**: opciones de quiz y checkboxes no soportan teclado consistente.
  - Archivos: `components/quizzes/quiz-player.tsx`, `components/missions/mission-run-wizard.tsx`
  - Criterio: `aria-pressed`/`aria-busy` y controles focusables coherentes.

- **Sin smoke tests**: no hay cobertura automatica minima de rutas criticas.
  - Archivos: `package.json`, `tests/smoke/*.md` (plan + scripts sugeridos)
  - Criterio: checklist ejecutable manual y estructura lista para automatizacion.

## Flujos cubiertos por este backlog

1. Login/registro/callback.
2. Dashboard y navegacion protegida.
3. Expedientes (alta, carga, extraccion, validacion).
4. Misiones (extract -> HITL -> planner -> writer -> training).
5. Quizzes (generacion, intento, scoring y recompensa).
