-- ============================================
-- Ulpianito - Dedupe constraints for AI inserts
-- Run AFTER 008_validation_queue.sql
-- ============================================

create unique index if not exists uq_sujetos_ai_dedupe
  on public.sujetos (
    expediente_id,
    lower(trim(nombre)),
    lower(trim(rol_procesal)),
    coalesce(lower(trim(dni)), '')
  )
  where origen = 'ia';

create unique index if not exists uq_activos_ai_dedupe
  on public.activos (
    expediente_id,
    lower(trim(descripcion)),
    upper(trim(moneda)),
    coalesce(round(valor_estimado, 2), -1)
  )
  where origen = 'ia';
