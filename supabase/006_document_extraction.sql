-- ============================================
-- Ulpianito - Extracción IA por documento (Gemini)
-- Run AFTER 004_expedientes_detalle_360.sql
-- ============================================
-- Añade estado y payload JSON del reporte segmentado
-- (partes/proceso, patrimonial, otros). Ejecutar en SQL Editor.
-- ============================================

alter table public.documentos
  add column if not exists extraction_status text not null default 'pending',
  add column if not exists extraction_report jsonb,
  add column if not exists extraction_error text,
  add column if not exists extraction_at timestamptz,
  add column if not exists extraction_model text;

comment on column public.documentos.extraction_status is
  'Estado del pipeline: pending | processing | done | failed';
comment on column public.documentos.extraction_report is
  'Reporte estructurado (JSON) con schema_version y secciones partes_y_proceso, aspecto_patrimonial, otros';
comment on column public.documentos.extraction_error is
  'Mensaje de error si extraction_status = failed';
comment on column public.documentos.extraction_at is
  'Última vez que se completó una extracción exitosa';
comment on column public.documentos.extraction_model is
  'Identificador del modelo usado (ej. gemini-2.0-flash)';

alter table public.documentos
  add constraint documentos_extraction_status_check
  check (extraction_status in ('pending', 'processing', 'done', 'failed'));

create index if not exists idx_documentos_extraction_status
  on public.documentos (extraction_status);
