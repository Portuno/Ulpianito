# Estrategia de Deduplicacion e Idempotencia

## Objetivo

Evitar duplicados al aplicar reportes de extraccion IA y hacer el flujo reintenable sin contaminar datos.

## Implementacion aplicada en app

- Archivo: `app/(dashboard)/expedientes/actions.ts`
- Accion: `applyExtractionToExpediente`
- Mejoras implementadas:
  - Normalizacion de textos (`trim + lowercase + colapso de espacios`).
  - Claves de dedupe en memoria para `sujetos` y `activos`.
  - Comparacion contra:
    - registros existentes en DB del expediente
    - registros vistos dentro del mismo reporte
  - Insercion solo si no existe clave equivalente.

## Estrategia de dedupe por entidad

- `sujetos`
  - llave: `nombre_normalizado + rol_procesal_normalizado + dni_normalizado`
- `activos`
  - llave: `descripcion_normalizada + moneda_normalizada + valor_redondeado`

## Idempotencia a nivel BD (recomendada)

- Crear indices unicos parciales para registros `origen = 'ia'`.
- Beneficio: protege incluso ante concurrencia o regresiones en capa app.

## Comportamiento esperado

- Reaplicar una extraccion ya aplicada:
  - no inserta duplicados
  - mantiene respuesta exitosa con conteos en 0 cuando no hay novedades

## Metricas de control

- `% de aplicaciones con inserts en 0` (indica reintentos o extracciones repetidas).
- `duplicados evitados` por corrida (puede enviarse en `product_events.meta`).
- `errores unique_violation` en tablas de destino (deberian tender a cero).
