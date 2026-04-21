# Testing and Release Playbook

## Smoke suite manual (obligatoria pre-release)

1. Auth:
   - login valido
   - registro valido
   - redirect correcto para usuario autenticado/no autenticado
2. Expedientes:
   - alta expediente
   - upload documento
   - extraccion + validacion
3. Misiones:
   - run completo hasta `training_done`
4. Quizzes:
   - generar preguntas
   - enviar intento y verificar scoring

## Integracion critica

- Roles:
  - `jurista` sin acceso `admin/revisiones`
  - `admin` con acceso completo de revision
- RLS:
  - usuario de despacho A no ve datos de despacho B

## Gate de release

- `lint` sin errores.
- smoke checklist completo.
- revision de cambios SQL en carpeta `supabase/` (archivos numerados).
- confirmacion de variables necesarias para edge functions.

## Estrategia de deploy

1. Staging (validacion funcional completa).
2. Canary (subset de usuarios internos).
3. Produccion (rollout completo).
