# Contexto funcional del proyecto Ulpianito

## 1) Vision general del producto

Ulpianito es una plataforma legal multi-tenant (por `despacho`) montada sobre Next.js + Supabase.
Combina:

- Gestion de expedientes y documentos legales.
- Flujo asistido por IA con validacion humana (HITL).
- Sistema de gamificacion con economia interna `IUS`.
- Quizzes para entrenamiento y evaluacion.

El aislamiento entre estudios juridicos se implementa a nivel de base de datos con RLS por `despacho_id`.

---

## 2) Stack y arquitectura tecnica

- Frontend/SSR: Next.js App Router.
- Backend app: Server Actions + consultas directas a Supabase.
- Backend IA: Supabase Edge Functions (Deno).
- Persistencia: Postgres en Supabase con politicas RLS.
- Storage: bucket privado `documentos`.
- Economia: tablas `ius_wallets` + `ius_ledger` + RPCs idempotentes.

Patron general:
1. El usuario ejecuta una accion en la UI.
2. La Server Action valida sesion/permisos.
3. Se escribe estado en tablas de dominio.
4. Si aplica, se invoca Edge Function para procesar paso IA.
5. Se acreditan recompensas IUS via RPC.

---

## 3) Modelo de datos y dominios

## 3.1 Nucleo legal (MVP)

- `despachos`: organizacion/tenant.
- `profiles`: usuario con rol (`admin` o `jurista`) y pertenencia a despacho.
- `expedientes`: caso legal principal.
- `documentos`: archivos del expediente.
- `sujetos`: partes intervinientes.
- `facturas`: dimension de facturacion/validacion.

Funciones/automatismos base:
- `handle_updated_at()`: trigger para mantener `updated_at`.
- `handle_new_user()`: al crear usuario en `auth.users`, crea `despacho` y `profile`.
- `get_user_despacho_id()`: helper RLS para resolver despacho del usuario logueado.

## 3.2 Ampliacion 360 del expediente

Se extiende `expedientes` con:
- `jurisdiccion`, `sede`, `cuantia`, `estado_procesal`, `etiquetas`, `ai_summary`.

Nuevas tablas:
- `eventos`: timeline de hechos/plazos/audiencias.
- `activos`: dimension patrimonial (activos/pasivos).
- `fundamentos`: base normativa/jurisprudencial del caso.

Adicionalmente, `documentos` y `sujetos` agregan trazabilidad HITL (`origen`, `validado_por`, `validado_at`).

## 3.3 IUS + misiones + quizzes

- `ius_reward_rules`: reglas de recompensa por accion.
- `ius_wallets`: saldo acumulado por usuario.
- `ius_ledger`: movimientos inmutables de IUS (auditoria).
- `missions`: definicion de misiones (globales o por despacho).
- `mission_runs`: ejecuciones de una mision por usuario.
- `mission_step_events`: bitacora de eventos por paso.
- `hitl_reviews`: revision humana de entidades y riesgos.
- `training_reviews`: revision pedagogica final por admin.
- `quizzes`, `quiz_questions`, `quiz_attempts`, `quiz_attempt_answers`.

---

## 4) Seguridad, roles y permisos

## 4.1 Roles de aplicacion

- `jurista`: rol por defecto.
- `admin`: rol con privilegios ampliados (revision de entrenamiento, gestion de reglas/misiones).

Normalizacion de rol en app:
- `normalizeRole()` e `isAdminRole()` convierten variantes legacy al set actual.

Helper SQL:
- `is_admin()`: devuelve `true` si el usuario actual es admin.

## 4.2 RLS y aislamiento multi-tenant

Todas las tablas de dominio tienen RLS habilitado.
Regla transversal: acceso permitido solo a registros del mismo `despacho`.

Puntos clave:
- Usuarios ven/operan expedientes, documentos, sujetos, facturas, eventos, activos y fundamentos de su despacho.
- `missions` permite lectura de plantillas globales (`despacho_id null`) y de despacho.
- `training_reviews` se escribe solo por admin.
- `ius_ledger` y `ius_wallets` son visibles en el ambito del despacho (y wallet propia).

## 4.3 Storage privado

Bucket `documentos` (no publico) con politicas para operar solo sobre rutas:
`<despacho_id>/<expediente_id>/<archivo>`.

---

## 5) Funciones desarrolladas (catalogo detallado)

## 5.1 Server Actions de autenticacion (`app/(auth)/actions.ts`)

- `login(formData)`: login con email/password y redireccion a dashboard.
- `register(formData)`: alta de usuario, setea metadata (`nombre`, `apellido`, `nombre_despacho`) para trigger de perfil.
- `logout()`: cierra sesion y redirige a login.

## 5.2 Server Actions de expedientes (`app/(dashboard)/expedientes/actions.ts`)

- `createExpediente(formData)`: crea expediente usando `despacho_id` del perfil logueado.
- `updateExpedienteNotes(expedienteId, notas)`: actualiza notas del expediente.
- `createSujeto(formData)`: agrega parte/sujeto al expediente.
- `deleteSujeto(sujetoId, expedienteId)`: elimina sujeto.
- `uploadDocument(formData)`: valida archivo (obligatorio, max 10MB), sube a storage y persiste metadatos en `documentos`.
- `deleteDocument(documentId, storagePath, expedienteId)`: elimina archivo de storage + fila en BD.

## 5.3 Server Actions de misiones (`app/(dashboard)/misiones/actions.ts`)

- `createMissionRun(missionId, expedienteId?, documentoId?)`: inicia ejecucion de mision.
- `runExtractionAndValidation(runId)`: dispara `extractor-ius-basic` + `validator-ius-entities` y acredita IUS de extraccion.
- `submitHitlReview(runId, payload)`: guarda curacion humana de entidades/riesgo y mueve run a `plan_write`; acredita IUS HITL.
- `runPlannerStep(runId)`: ejecuta `planner-ius`.
- `runWriterStep(runId)`: ejecuta `writer-ius-document`; pasa a `training_pending`; acredita IUS plan+write.
- `submitTrainingReview(runId, payload)`: solo admin; aprueba/rechaza entrenamiento y si aprueba acredita IUS final.

## 5.4 Server Actions de quizzes (`app/(dashboard)/quizzes/actions.ts`)

- `createQuizDraft(input)`: crea quiz en estado `draft`.
- `generateQuizQuestions(quizId)`: invoca `ius-generate-quiz` para poblar preguntas y pasar a `ready`.
- `submitQuizAttempt(quizId, answers)`: corrige intento, guarda score y respuestas; si aprueba reclama IUS.

Constante de aprobacion:
- `QUIZ_PASS_THRESHOLD_PCT = 60`.

## 5.5 Funciones Edge (Supabase Functions)

- `extractor-ius-basic`: extrae partes/hechos/pretension (salida demo deterministica) y registra eventos del paso `extract`.
- `validator-ius-entities`: evalua coherencia economica/riesgos, deja `requires_hitl = true` y mueve run a `needs_human`.
- `planner-ius`: genera estrategia de negociacion y terminos sugeridos (paso `plan`).
- `writer-ius-document`: redacta borrador (correo de negociacion) y mueve run a `training_pending`.
- `ius-generate-quiz`: genera set fallback de preguntas MCQ, reemplaza preguntas previas y deja quiz `ready`.

## 5.6 RPC y funciones SQL de economia IUS

- `get_ius_rule_amount(action_key)`: busca monto activo de recompensa.
- `grant_ius_reward(profile, despacho, action_key, ref_type, ref_id, meta)`: inserta en ledger en forma idempotente.
- `claim_quiz_pass_reward(attempt_id)`: valida elegibilidad del intento y acredita recompensa quiz.
- `claim_mission_step_reward(run_id, action_key)`: acredita paso de mision permitido.
- Trigger `ius_ledger_apply_balance`: sincroniza automaticamente `ius_wallets` al insertar en `ius_ledger`.
- Trigger `ensure_ius_wallet_for_profile`: crea wallet al crear perfil.

---

## 6) Workflows de usuario

## 6.1 Onboarding y acceso

1. Usuario se registra.
2. Trigger `handle_new_user` crea despacho + perfil.
3. Usuario inicia sesion y entra al dashboard.

## 6.2 Gestion de expediente (workflow core)

1. Crear expediente.
2. Cargar documentos al bucket privado.
3. Cargar sujetos/partes.
4. Gestionar datos patrimoniales/facturacion y notas.
5. Consultar detalle en pestañas: documental, sujetos, patrimonial, miscelaneo.

## 6.3 Mision IUS end-to-end (con HITL)

1. Iniciar mision (`mission_run` en `draft`).
2. Ejecutar extraccion + validacion:
   - `extractor_output` y `validator_output`.
   - estado pasa a `needs_human`, paso `hitl`.
3. Completar revision HITL manual (mapeo de entidades + aceptacion de riesgo economico).
4. Ejecutar planificacion (`planner_output`).
5. Ejecutar redaccion (`writer_output`) y pasar a `training_pending`.
6. Admin revisa entrenamiento:
   - aprobado: `training_done` + paso `done`.
   - requiere trabajo: `training_pending`.

## 6.4 Workflow de quiz

1. Crear quiz draft.
2. Generar preguntas automaticamente.
3. Resolver quiz y enviar respuestas.
4. Se calcula score y estado de aprobacion.
5. Si aprueba (>= 60%), se reclama recompensa IUS idempotente.

---

## 7) Capacidades por tipo de usuario

## 7.1 Jurista

- Operar expedientes/documentos/sujetos/facturas de su despacho.
- Iniciar y ejecutar sus propias misiones.
- Completar HITL de sus runs.
- Crear y resolver quizzes.
- Ver saldo IUS y movimientos del despacho.

## 7.2 Admin

Incluye todo lo de jurista, mas:
- Revisar entrenamientos pendientes (`/admin/revisiones`).
- Aprobar/rechazar fase final de entrenamiento.
- Gestionar escritura de reglas/misiones segun politicas RLS.

---

## 8) Estados y semantica operacional

## 8.1 `mission_runs.current_step`

- `extract`
- `hitl`
- `plan_write`
- `training_review`
- `done`

## 8.2 `mission_runs.status`

- `draft`
- `running`
- `needs_human`
- `training_pending`
- `training_done`
- `completed` (reservado/compatible)
- `failed` (reservado/compatible)

## 8.3 `quizzes.status`

- `draft`: creado sin preguntas.
- `ready`: listo para resolver.

---

## 9) Seed y configuraciones relevantes ya incorporadas

- Mision global base: `campamento-licencia`.
- Reglas IUS iniciales:
  - `quiz_passed`
  - `mission_step_extract`
  - `mission_step_hitl`
  - `mission_step_plan_write`
  - `mission_training_approved`

Estas reglas permiten gamificar el progreso del flujo IA + entrenamiento.

---

## 10) Notas operativas

- El diseno actual privilegia trazabilidad y control humano (HITL) sobre autonomia total IA.
- La salida de Edge Functions usa contenido demo/fallback y esta preparada para evolucionar a LLM real.
- El ledger IUS es inmutable e idempotente para evitar dobles acreditaciones.
- El aislamiento por despacho es la garantia principal de seguridad de datos en toda la plataforma.
