# Ulpianito v0.9 - User stories

## Rol jurista

### US-01 Crear expediente inicial

Como jurista, quiero crear un expediente en menos de 3 minutos para empezar a centralizar documentos y seguimiento.

- Criterios de aceptacion:
  - Puede crear expediente con datos minimos.
  - Al finalizar, aparece en listado y en dashboard.
  - Se registra evento de activacion.
- Dependencias: `app/(dashboard)/expedientes/nuevo/page.tsx`, `app/(dashboard)/expedientes/actions.ts`.

### US-02 Subir y extraer documento

Como jurista, quiero subir un documento y obtener extraccion IA para reducir carga manual.

- Criterios de aceptacion:
  - Upload exitoso con feedback claro.
  - Extraccion inicia y finaliza con estado visible.
  - Resultado editable antes de aplicar.
- Dependencias: `components/expedientes/document-upload.tsx`, `document-detail-workspace.tsx`, `supabase/functions/document-extract-gemini/index.ts`.

### US-03 Validar y aplicar extraccion

Como jurista, quiero validar/corregir la extraccion y aplicarla al expediente para mantener calidad juridica.

- Criterios de aceptacion:
  - Puede editar `extraction_report` y confirmar validacion.
  - Aplicacion crea/actualiza entidades sin duplicados criticos.
  - Queda trazabilidad de la accion.
- Dependencias: `app/(dashboard)/expedientes/actions.ts`, `supabase/009_dedup_constraints_ai.sql`.

### US-04 Ejecutar mision IA

Como jurista, quiero ejecutar una mision end-to-end para producir un borrador util con supervision.

- Criterios de aceptacion:
  - Puede crear run y avanzar pasos.
  - Errores edge se muestran controlados.
  - Estado final del run es consultable.
- Dependencias: `app/(dashboard)/misiones/actions.ts`, `components/missions/mission-run-wizard.tsx`.

### US-05 Resolver quiz y recibir IUS

Como jurista, quiero resolver quizzes para mejorar habilidades y recibir recompensas IUS.

- Criterios de aceptacion:
  - Puede responder preguntas y enviar intento.
  - Se calcula score/pass-fail correctamente.
  - Si aprueba, se acredita IUS una sola vez por intento elegible.
- Dependencias: `app/(dashboard)/quizzes/actions.ts`, `supabase/005_ius_gamification.sql`.

## Rol admin

### US-06 Revisar entrenamiento de misiones

Como admin, quiero revisar resultados de entrenamiento para aprobar, rechazar o pedir ajustes.

- Criterios de aceptacion:
  - Solo admin accede a revisiones.
  - Puede registrar decision con consistencia.
  - Queda trazabilidad por run y usuario.
- Dependencias: `app/(dashboard)/admin/revisiones/page.tsx`, `lib/auth/guards.ts`.

### US-07 Supervisar calidad operativa

Como admin, quiero ver estado de validacion, errores y conversion para priorizar mejoras.

- Criterios de aceptacion:
  - Existen indicadores minimos de cola, errores edge y conversion del funnel.
  - Se detectan desvios por despacho o modulo.
- Dependencias: `supabase/007_product_events_analytics.sql`, `supabase/008_validation_queue.sql`.

## Backlog de historias proximas (P1/P2)

- US-08 (P1): Como revisor, quiero una bandeja `/validacion` operativa con claim y SLA.
- US-09 (P1): Como jurista, quiero onboarding contextual para completar primer caso guiado.
- US-10 (P2): Como admin, quiero reglas anti-abuso de IUS con alertas automaticas.
