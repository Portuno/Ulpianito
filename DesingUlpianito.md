# DesingUlpianito

## 1) Resumen ejecutivo

Ulpianito es una plataforma legal multi-tenant para despachos jurídicos, construida con Next.js + Supabase, enfocada en:

- Gestión integral de expedientes y documentación.
- Extracción asistida por IA con validación humana (HITL).
- Flujo gamificado con economía interna `IUS`.
- Entrenamiento del equipo mediante misiones y quizzes.

El objetivo operativo es acelerar el ciclo `expediente -> documento -> extracción -> validación -> acción`, manteniendo trazabilidad, control humano y aislamiento de datos por despacho.

## 2) Stack tecnológico y arquitectura

### Frontend / App

- Framework: `Next.js` (App Router), `React`, `TypeScript`.
- UI: `Tailwind`, `Shadcn`, `Radix`, `lucide-react`, `sonner`.
- Estructura de layouts:
  - `app/layout.tsx`: metadata global + toaster.
  - `app/(dashboard)/layout.tsx`: `Sidebar + Topbar + contenido`.

### Backend de aplicación

- Server Actions (Next.js) para casos de uso críticos:
  - Auth
  - Expedientes/documentos/sujetos
  - Misiones
  - Quizzes
- Cliente Supabase SSR en servidor:
  - `lib/supabase/server.ts`
  - Manejo de cookies y sesión para SSR/actions.

### Backend IA y procesos

- Supabase Edge Functions para pasos IA:
  - `extractor-ius-basic`
  - `validator-ius-entities`
  - `planner-ius`
  - `writer-ius-document`
  - `ius-generate-quiz`
  - `document-extract-gemini`
- Invocación autenticada desde app:
  - `lib/ius/edge-invoke.ts`

### Persistencia y seguridad

- Base de datos: PostgreSQL (Supabase).
- Storage privado: bucket `documentos`.
- Seguridad: RLS por `despacho_id` + rol (`admin`, `jurista`).
- Principio de aislamiento: cada usuario accede solo al ámbito de su despacho.

## 3) Modelo funcional del producto

### 3.1 Núcleo de negocio legal

Entidades base:

- `despachos`
- `profiles`
- `expedientes`
- `documentos`
- `sujetos`
- `facturas`

Automatismos:

- Trigger de `updated_at` para tablas con edición.
- Trigger `handle_new_user` para crear despacho + perfil al registrarse.
- Helper de seguridad para resolver despacho actual.

### 3.2 Extensión 360 del expediente

Ampliaciones clave:

- Metadatos del expediente: jurisdicción, sede, cuantía, estado procesal, etiquetas, resumen IA.
- Timeline legal: `eventos`.
- Dimensión patrimonial: `activos`.
- Base normativa/jurisprudencial: `fundamentos`.
- Trazabilidad HITL en datos sensibles (`origen`, `validado_por`, `validado_at`).

### 3.3 Capa de entrenamiento y gamificación

Economía IUS:

- Reglas: `ius_reward_rules`.
- Saldo: `ius_wallets`.
- Movimientos inmutables: `ius_ledger`.
- Idempotencia por `idempotency_key`.

Aprendizaje:

- Plantillas de misión: `missions`.
- Ejecuciones: `mission_runs`.
- Eventos de pasos: `mission_step_events`.
- Revisiones humanas: `hitl_reviews`.
- Revisión final pedagógica: `training_reviews`.

Quizzes:

- `quizzes`
- `quiz_questions`
- `quiz_attempts`
- `quiz_attempt_answers`

## 4) Rutas y módulos principales de la app

### Acceso y sesión

- `/login`
- `/register`

### Dashboard y operación

- `/dashboard`: KPIs de documentos, expedientes, pendientes, actividad semanal, saldo IUS.
- `/expedientes`: listado y acceso a creación.
- `/expedientes/nuevo`: alta de expediente.
- `/expedientes/[id]`: detalle del caso.
- `/expedientes/[id]/documentos/[documentoId]`: extracción/validación por documento.
- `/ingesta`: entrada orientada a carga y operación documental.
- `/validacion`: vista conceptual HITL (actualmente orientada a revisión/admin).

### Gamificación y formación

- `/misiones`: catálogo y ejecuciones recientes.
- `/misiones/runs/[id]`: seguimiento paso a paso.
- `/quizzes`: creación + listado.
- `/quizzes/[id]`: resolución e intento.
- `/ius`: visión de economía y recompensas.
- `/admin/revisiones`: revisión de entrenamiento (administrador).

### Módulos complementarios visibles

- `/agentes`
- `/academia`
- `/directorio`
- `/documentacion`
- `/configuracion`

## 5) Casos de uso implementados (acciones de servidor)

### Auth (`app/(auth)/actions.ts`)

- `login`
- `register`
- `logout`

### Expedientes (`app/(dashboard)/expedientes/actions.ts`)

- Crear expediente.
- Actualizar notas.
- Crear/eliminar sujetos.
- Subir/eliminar documentos (con validación de archivo).
- Flujo de extracción/validación/aplicación de datos con control de duplicados.

### Misiones (`app/(dashboard)/misiones/actions.ts`)

- Crear `mission_run`.
- Ejecutar extracción y validación.
- Registrar revisión HITL.
- Ejecutar planificación.
- Ejecutar redacción.
- Registrar revisión de entrenamiento (admin).

### Quizzes (`app/(dashboard)/quizzes/actions.ts`)

- Crear quiz draft.
- Generar preguntas IA.
- Enviar intento y calcular resultado.
- Reclamar recompensa IUS al aprobar.

## 6) Flujos end-to-end

### 6.1 Onboarding operativo

Ruta ideal para nuevo usuario:

1. Crear primer expediente.
2. Subir primer documento.
3. Ejecutar extracción y validar resultado.

Meta propuesta: completar el primer caso en menos de 10 minutos sin soporte.

### 6.2 Flujo documental + IA + HITL

1. Documento se carga al expediente.
2. Se ejecuta extracción IA.
3. Estado pasa por `pending/processing/done/failed`.
4. Resultado estructurado queda en `extraction_report`.
5. Validación humana revisa y corrige.
6. Aplicación de datos al expediente con deduplicación.

### 6.3 Flujo de misión IUS

1. Crear run (`draft`).
2. Extraer/validar (`running` -> `needs_human`).
3. Curación HITL (`hitl`).
4. Plan + writer (`plan_write` -> `training_pending`).
5. Revisión admin (`training_review` -> `training_done` / mantiene pending).
6. Recompensas IUS por paso (idempotentes).

### 6.4 Flujo de quizzes

1. Crear quiz draft.
2. Generar preguntas.
3. Resolver intento.
4. Calcular score.
5. Si supera umbral (`>=60%`), acredita IUS.

## 7) Seguridad y gobierno de datos

### Multi-tenant por despacho

- RLS activo en tablas de dominio.
- Políticas limitan lectura/escritura al `despacho_id` del usuario autenticado.

### Roles

- `jurista`: operación cotidiana.
- `admin`: capacidades ampliadas (revisión entrenamiento, acciones de control).

### Storage privado

- Bucket `documentos` no público.
- Convención de ruta por despacho/expediente para segmentación lógica.

### Idempotencia y consistencia

- Ledger IUS con clave única para evitar doble premio.
- Claims de recompensa encapsulados en RPCs.
- Dedupe de entidades IA en app + constraints SQL.

## 8) Diseño de datos SQL (migraciones)

Secuencia principal identificada:

1. `supabase/001_initial_schema.sql`
2. `supabase/002_rls_policies.sql`
3. `supabase/003_storage_buckets.sql`
4. `supabase/004_expedientes_detalle_360.sql`
5. `supabase/005_ius_gamification.sql`
6. `supabase/006_document_extraction.sql`
7. `supabase/007_product_events_analytics.sql`
8. `supabase/008_validation_queue.sql`
9. `supabase/009_dedup_constraints_ai.sql`

### Módulos SQL relevantes por objetivo

- Base tenant + perfiles + expediente: `001`.
- Políticas RLS base: `002`.
- Bucket y reglas de storage: `003`.
- Vista 360 expediente (eventos/activos/fundamentos): `004`.
- IUS + misiones + quizzes + RPC: `005`.
- Extracción por documento: `006`.
- Eventos de producto (analytics): `007`.
- Cola operativa de validación: `008`.
- Constraints de dedupe IA: `009`.

## 9) Instrumentación y analítica de producto

Tabla analítica:

- `product_events`

Función:

- `track_product_event(...)`

Taxonomía propuesta:

- Activación: `expediente.created`, `documento.uploaded`, `documento.extraction_completed`, etc.
- Misiones: `mission_run.created`, `mission_run.hitl_submitted`, etc.
- Quizzes: `quiz.created`, `quiz.attempt_submitted`, `quiz.attempt_passed/failed`.
- UX transversal: clics en CTA de empty state y next-best-action.

KPIs propuestos:

- Activación 24h.
- Conversión upload -> extracción completa.
- Tasa validación HITL sobre extraídos.
- Aprobación de entrenamiento.
- Pass rate de quizzes.

## 10) Operación HITL y cola de validación

Implementación de cola:

- `validation_queue_assignments`
- View: `validation_queue_items`
- RPC: `claim_validation_queue_item(...)`

Estados:

- `queued`, `in_review`, `blocked`, `done`, `cancelled`.

Priorización recomendada:

- Combinación de riesgo, urgencia y antigüedad.

SLA sugerido:

- Alta <= 4h.
- Media <= 24h.
- Baja <= 72h.

## 11) Estado actual del proyecto (foto útil para NotebookLM)

### Fortalezas actuales

- Arquitectura full-stack coherente para MVP productivo.
- Multi-tenant con RLS bien extendido.
- Flujo IA + HITL ya modelado de extremo a extremo.
- Economía IUS con auditoría e idempotencia.
- Base de analítica y cola operativa ya definidas.

### Brechas y oportunidades inmediatas

- Onboarding guiado y empty states todavía en fase de diseño/documentación.
- `/validacion` aún no materializa toda la bandeja operativa propuesta.
- Instrumentación de eventos necesita cobertura completa en rutas críticas.
- Evolución de funciones IA desde fallback/demo hacia proveedor real consistente.

## 12) Roadmap 30/60/90 consolidado

### 0-30 días

- Onboarding 3 pasos + empty states accionables.
- Instrumentar eventos de producto prioritarios.
- Objetivo: subir activación y CTR de CTA principal.

### 31-60 días

- Desplegar cola de validación con SLA.
- Reducir tiempo upload->validación.
- Consolidar dedupe/idempotencia en operación real.

### 61-90 días

- Dashboard analítico por despacho.
- Priorización avanzada y alertas de pendientes críticos.
- Mejorar frecuencia de uso y aprobación en primera revisión.

## 13) Checklist QA resumido

Validar:

- Permisos por rol (`jurista` vs `admin`).
- Flujo completo de misión hasta entrenamiento.
- Recompensas IUS por cada paso esperado.
- Ausencia de duplicación de recompensas.
- Flujo de quizzes y acreditación condicional.
- Presencia de accesos UI y métricas principales en dashboard.

## 14) Glosario rápido

- `HITL`: Human In The Loop (validación humana sobre IA).
- `IUS`: unidad interna de recompensa del producto.
- `RLS`: Row Level Security (aislamiento por fila).
- `mission_run`: instancia ejecutada de una misión.
- `training_review`: revisión final por rol admin.
- `product_events`: bitácora analítica de eventos de uso.

## 15) Fuentes internas usadas para esta síntesis

- `package.json`
- `app/layout.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/expedientes/page.tsx`
- `app/(dashboard)/misiones/page.tsx`
- `app/(dashboard)/quizzes/page.tsx`
- `app/(dashboard)/validacion/page.tsx`
- `app/(dashboard)/ingesta/page.tsx`
- `lib/supabase/server.ts`
- `lib/auth/profile.ts`
- `lib/ius/edge-invoke.ts`
- `docs/contaxto 18 abril.md`
- `docs/ius-qa-checklist.md`
- `docs/product-audit/*`
- `supabase/001..009*.sql`
- `supabase/functions/README_IUS.md`
