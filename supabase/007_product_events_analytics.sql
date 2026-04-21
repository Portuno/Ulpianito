-- ============================================
-- Ulpianito - Product Events Analytics
-- Run AFTER 006_document_extraction.sql
-- ============================================

create table if not exists public.product_events (
  id uuid default uuid_generate_v4() primary key,
  despacho_id uuid references public.despachos(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete set null,
  event_key text not null,
  entity_type text,
  entity_id uuid,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

comment on table public.product_events is 'Eventos de producto para analitica de activacion y uso';
comment on column public.product_events.event_key is 'Clave canonica, ej: documento.uploaded';

create index if not exists idx_product_events_despacho_created
  on public.product_events(despacho_id, created_at desc);

create index if not exists idx_product_events_profile_created
  on public.product_events(profile_id, created_at desc);

create index if not exists idx_product_events_key_created
  on public.product_events(event_key, created_at desc);

create index if not exists idx_product_events_entity
  on public.product_events(entity_type, entity_id);

alter table public.product_events enable row level security;

create policy "product_events_select_despacho"
  on public.product_events for select
  to authenticated
  using (despacho_id = public.get_user_despacho_id());

create policy "product_events_insert_own_or_admin"
  on public.product_events for insert
  to authenticated
  with check (
    despacho_id = public.get_user_despacho_id()
    and (profile_id = auth.uid() or public.is_admin())
  );

create or replace function public.track_product_event(
  p_event_key text,
  p_despacho_id uuid,
  p_profile_id uuid default auth.uid(),
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_meta jsonb default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
begin
  if p_event_key is null or length(trim(p_event_key)) = 0 then
    raise exception 'track_product_event: p_event_key requerido';
  end if;

  insert into public.product_events (
    despacho_id,
    profile_id,
    event_key,
    entity_type,
    entity_id,
    meta
  )
  values (
    p_despacho_id,
    p_profile_id,
    trim(p_event_key),
    p_entity_type,
    p_entity_id,
    coalesce(p_meta, '{}'::jsonb)
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

comment on function public.track_product_event(text, uuid, uuid, text, uuid, jsonb)
  is 'Registra un evento de producto para analitica (app y edge functions).';

grant execute on function public.track_product_event(text, uuid, uuid, text, uuid, jsonb) to authenticated;
grant execute on function public.track_product_event(text, uuid, uuid, text, uuid, jsonb) to service_role;
