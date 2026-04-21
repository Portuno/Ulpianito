# Onboarding y Empty States por Ruta Critica

## Objetivo

Reducir tiempo a valor del usuario nuevo y evitar navegacion pasiva en pantallas vacias.

## Flujo de onboarding recomendado (primer caso en 3 pasos)

1. **Crear expediente**
   - Ruta: `/expedientes` -> CTA `Nuevo Expediente`.
   - Exito: expediente creado y redireccion a `/expedientes/[id]`.
2. **Subir primer documento**
   - Ruta: `/expedientes/[id]` (tab documental).
   - Exito: documento visible en listado del expediente.
3. **Ejecutar y validar extraccion**
   - Ruta: `/expedientes/[id]/documentos/[documentoId]`.
   - Exito: `extraction_status = done`, validacion humana, opcion de aplicar datos.

## Donde implementar onboarding en frontend

- `app/page.tsx`
  - Mantener redirect a `/dashboard`, pero renderizar en `dashboard` una card de "Primer caso" cuando no existan expedientes o documentos.
- `app/(dashboard)/dashboard/page.tsx`
  - Agregar bloque "Siguiente mejor accion" en base a:
    - `expedientes == 0` -> crear expediente.
    - `expedientes > 0` y `documentos == 0` -> subir documento.
    - `documentos > 0` y pendientes de validacion -> abrir validacion/documento.
- `components/dashboard/quick-actions.tsx`
  - Priorizar CTA contextual antes de acciones genericas.

## Empty states accionables por ruta

### `/dashboard`

- Estado vacio:
  - Titulo: "Todavia no hay actividad".
  - CTA principal: "Crear primer expediente".
  - CTA secundaria: "Ver guia de 2 minutos".

### `/expedientes`

- Cuando no hay registros:
  - Mensaje: "No tenes expedientes creados".
  - CTA: `Nuevo Expediente`.
  - Helper: "Crea uno para empezar a cargar documentacion y extraer datos."

### `/misiones`

- `missions.length === 0`:
  - Mantener texto actual y agregar CTA para volver al expediente y generar contexto.
- `runs.length === 0`:
  - Mensaje orientado a valor: "Inicia una mision sobre un documento para entrenar criterios y sumar IUS."
  - CTA: "Iniciar mision".

### `/quizzes`

- Sin quizzes:
  - Mensaje: "Todavia no hay quizzes para practicar."
  - CTA: "Crear primer quiz".
  - Nota: sugerir fuente (`sourceLabel`) para mejor calidad.

## Criterios de aceptacion

- Usuario nuevo completa los 3 pasos en menos de 10 minutos sin ayuda externa.
- El dashboard siempre muestra una CTA principal contextual (nunca estado muerto).
- Cada vista principal tiene al menos un empty state con CTA navegable.

## Metrica primaria

- `% usuarios que completan primer caso en 24h`.
