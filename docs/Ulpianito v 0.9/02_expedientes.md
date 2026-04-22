# Ulpianito v0.9 - Expedientes

## Alcance

Gestion de expediente legal, sujetos, notas, documentos y aplicacion de extraccion IA a entidades del caso.

## Estado actual

- `Operativo`:
  - Crear y listar expedientes.
  - Ver detalle 360 con tabs y timeline.
  - Subir/borrar documentos.
  - Ejecutar extraccion IA por documento.
  - Validar manualmente el reporte de extraccion.
  - Aplicar extraccion a sujetos/activos con dedupe app+DB.
- `Parcial`:
  - Gestion patrimonial completa (activos/facturas/eventos) aun no totalmente cerrada en UI.

## Evidencia en codigo

- Paginas:
  - `app/(dashboard)/expedientes/page.tsx`
  - `app/(dashboard)/expedientes/nuevo/page.tsx`
  - `app/(dashboard)/expedientes/[id]/page.tsx`
  - `app/(dashboard)/expedientes/[id]/documentos/[documentoId]/page.tsx`
- Acciones:
  - `app/(dashboard)/expedientes/actions.ts`
- Componentes:
  - `components/expedientes/*`
- View-model:
  - `lib/expediente-view-model.ts`
  - `lib/build-expediente-timeline.ts`

## Datos y SQL asociados

- Base de esquema: `supabase/001_initial_schema.sql`
- Detalle 360: `supabase/004_expedientes_detalle_360.sql`
- Extraccion documental: `supabase/006_document_extraction.sql`
- Dedupe IA: `supabase/009_dedup_constraints_ai.sql`

## Brechas y prioridades

- `P0`: fortalecer manejo operativo de errores para flujo upload -> extract -> validar -> aplicar.
- `P1`: cerrar CRUD patrimonial integral en UI.
- `P1`: instrumentar eventos de producto obligatorios en cada paso.
