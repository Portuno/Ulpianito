# Edge Contracts and Retry Policy

## Contrato estandar de request

```json
{
  "run_id": "uuid",
  "documento_id": "uuid",
  "quiz_id": "uuid"
}
```

Solo enviar los campos necesarios para cada funcion.

## Contrato estandar de response

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

En error:

```json
{
  "ok": false,
  "data": null,
  "error": "mensaje operativo"
}
```

## Reglas de robustez aplicadas

- Timeout cliente de 30s en `lib/ius/edge-invoke.ts`.
- Mensajes de error normalizados al usuario en acciones server de:
  - `app/(dashboard)/misiones/actions.ts`
  - `app/(dashboard)/quizzes/actions.ts`

## Reintentos recomendados (manual/orquestador)

- Errores 429/5xx: hasta 2 reintentos con backoff exponencial.
- Errores de validacion (`4xx` funcional): sin reintento, corregir input.
- Toda operacion de recompensa debe mantenerse idempotente por llave unica.
