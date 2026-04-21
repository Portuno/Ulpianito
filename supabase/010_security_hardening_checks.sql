-- Security hardening checks (manual execution by maintainer)
-- This file is intentionally additive and does not auto-run.

-- 1) Ensure helper function cannot be hijacked by search_path.
create or replace function public.get_user_despacho_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select despacho_id from public.profiles where id = auth.uid();
$$;

-- 2) Defensive index for frequent policy joins by expediente_id.
create index if not exists idx_documentos_expediente_id on public.documentos(expediente_id);
create index if not exists idx_sujetos_expediente_id on public.sujetos(expediente_id);
create index if not exists idx_facturas_expediente_id on public.facturas(expediente_id);

-- 3) Optional verification queries.
-- select * from pg_policies where schemaname='public' order by tablename, policyname;
-- explain analyze select * from public.documentos where expediente_id = '<uuid>';
