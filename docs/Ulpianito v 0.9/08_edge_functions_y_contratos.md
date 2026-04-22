# Ulpianito v0.9 - Edge functions y contratos

## Alcance

Contrato comun de invocacion, resiliencia y trazabilidad para funciones edge de IA.

## Inventario edge actual

- `extractor-ius-basic`
- `validator-ius-entities`
- `planner-ius`
- `writer-ius-document`
- `ius-generate-quiz`
- `document-extract-gemini`

Fuente: `supabase/functions/README_IUS.md`.

## Estado actual

- `Operativo`:
  - Wrapper de invocacion con timeout y auth en `lib/ius/edge-invoke.ts`.
  - Integracion en acciones de expedientes/misiones/quizzes.
- `Parcial`:
  - Varias funciones con salida demo/fallback.

## Contrato recomendado minimo

- Request:
  - `run_id` o `documento_id` como correlation key.
  - `payload` tipado por caso de uso.
  - metadata no sensible.
- Response:
  - `ok: boolean`
  - `data` en caso exitoso
  - `error` estructurado (`code`, `message`, `retryable`)
  - `duration_ms`

## Trazabilidad y resiliencia

- Timeout por invocacion (actualmente 30s).
- Reintentos solo en errores transitorios.
- Idempotencia por clave logica de negocio para evitar doble procesamiento.

## Prioridades

- `P0`: homogeneizar schema de respuesta en todas las funciones.
- `P1`: observabilidad por funcion (latencia, error rate, retries).
- `P1`: separar claramente modo demo de modo productivo.
