# Ulpianito v0.9 - Quizzes

## Alcance

Generacion y resolucion de quizzes para entrenamiento juridico y refuerzo de aprendizaje con incentivo IUS.

## Estado actual

- `Operativo`:
  - Crear quiz draft.
  - Generar preguntas con edge function.
  - Resolver quiz en UI.
  - Guardar intento y respuestas.
  - Calcular score y pass/fail.
  - Recompensar IUS por aprobacion.
- `Parcial`:
  - Profundidad pedagogica y adaptatividad por perfil.

## Evidencia en codigo

- Paginas:
  - `app/(dashboard)/quizzes/page.tsx`
  - `app/(dashboard)/quizzes/[id]/page.tsx`
- Acciones:
  - `app/(dashboard)/quizzes/actions.ts`
- Componente:
  - `components/quizzes/quiz-player.tsx`

## Evidencia backend

- Edge function: `supabase/functions/ius-generate-quiz/index.ts`
- Persistencia y rewards: `supabase/005_ius_gamification.sql`

## Prioridades

- `P0`: estandarizar validaciones de payload en todos los intentos.
- `P1`: mejorar dificultad dinamica por historial.
- `P1`: instrumentar eventos para funnel `draft -> generated -> submitted -> passed`.
