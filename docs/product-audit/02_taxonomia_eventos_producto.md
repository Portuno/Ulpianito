# Taxonomia de Eventos de Producto

## Objetivo

Medir activacion, calidad operativa y engagement en todo el flujo expediente -> documento -> extraccion -> validacion -> mision -> quiz.

## Convenciones

- `event_key`: `modulo.accion` en snake_case (`expediente.created`).
- `entity_type`: `expediente | documento | mission_run | quiz | quiz_attempt | ui`.
- `entity_id`: UUID de la entidad principal, si aplica.
- `meta`: JSONB con contexto no sensible (evitar PII cruda).

## Eventos minimos obligatorios

### Activacion

- `expediente.created`
- `documento.uploaded`
- `documento.extraction_requested`
- `documento.extraction_completed`
- `documento.extraction_validated`
- `documento.extraction_applied`

### Misiones

- `mission_run.created`
- `mission_run.extract_completed`
- `mission_run.hitl_submitted`
- `mission_run.writer_completed`
- `mission_run.training_reviewed`

### Quizzes

- `quiz.created`
- `quiz.questions_generated`
- `quiz.attempt_submitted`
- `quiz.attempt_passed`
- `quiz.attempt_failed`

### UX transversal

- `ui.empty_state_cta_clicked`
- `ui.next_best_action_clicked`

## Puntos de instrumentacion actuales (backend)

- `app/(dashboard)/expedientes/actions.ts`
  - `createExpediente` -> `expediente.created`
  - `uploadDocument` -> `documento.uploaded`
  - `runDocumentExtraction` -> requested/completed/error
  - `validateDocumentExtraction` -> `documento.extraction_validated`
  - `applyExtractionToExpediente` -> `documento.extraction_applied`
- `app/(dashboard)/misiones/actions.ts`
  - `createMissionRun` -> `mission_run.created`
  - `runExtractionAndValidation` -> `mission_run.extract_completed`
  - `submitHitlReview` -> `mission_run.hitl_submitted`
  - `runWriterStep` -> `mission_run.writer_completed`
  - `submitTrainingReview` -> `mission_run.training_reviewed`
- `app/(dashboard)/quizzes/actions.ts`
  - `createQuizDraft` -> `quiz.created`
  - `generateQuizQuestions` -> `quiz.questions_generated`
  - `submitQuizAttempt` -> submitted + passed/failed

## Esquema de metadata recomendado por evento

- `expediente.created`
  - `{ "tipo": "...", "has_descripcion": true }`
- `documento.uploaded`
  - `{ "mime_type": "...", "size_bytes": 123, "expediente_id": "..." }`
- `documento.extraction_completed`
  - `{ "provider": "gemini", "duration_ms": 1200 }`
- `mission_run.created`
  - `{ "mission_id": "...", "has_expediente": true, "has_documento": false }`
- `quiz.attempt_submitted`
  - `{ "score_pct": 78.5, "passed": false, "questions_count": 5 }`

## KPIs derivados

- Activacion: `% usuarios con expediente.created + documento.uploaded en 24h`.
- Flujo IA: `% documento.extraction_completed sobre documento.uploaded`.
- Calidad: `% documento.extraction_validated sobre extraction_completed`.
- Entrenamiento: `% mission_run.training_reviewed con estado aprobado`.
- Learning: `quiz pass rate` por despacho y por tema (`source_label`).
