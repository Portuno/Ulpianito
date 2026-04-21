-- ============================================
-- Ulpianito - Validation Queue (HITL)
-- Run AFTER 007_product_events_analytics.sql
-- ============================================

create table if not exists public.validation_queue_assignments (
  id uuid default uuid_generate_v4() primary key,
  documento_id uuid references public.documentos(id) on delete cascade not null unique,
  despacho_id uuid references public.despachos(id) on delete cascade not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  status text not null default 'queued',
  priority_score integer not null default 0,
  queue_reason text,
  due_at timestamptz,
  claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint validation_queue_status_check
    check (status in ('queued', 'in_review', 'blocked', 'done', 'cancelled'))
);

create index if not exists idx_validation_queue_despacho_status
  on public.validation_queue_assignments(despacho_id, status, priority_score desc, created_at asc);

create index if not exists idx_validation_queue_assigned
  on public.validation_queue_assignments(assigned_to, status, updated_at desc);

create trigger set_updated_at_validation_queue_assignments
  before update on public.validation_queue_assignments
  for each row execute function public.handle_updated_at();

alter table public.validation_queue_assignments enable row level security;

create policy "validation_queue_select_despacho"
  on public.validation_queue_assignments for select
  to authenticated
  using (despacho_id = public.get_user_despacho_id());

create policy "validation_queue_insert_despacho"
  on public.validation_queue_assignments for insert
  to authenticated
  with check (
    despacho_id = public.get_user_despacho_id()
    and public.is_admin()
  );

create policy "validation_queue_update_despacho"
  on public.validation_queue_assignments for update
  to authenticated
  using (despacho_id = public.get_user_despacho_id())
  with check (despacho_id = public.get_user_despacho_id());

create or replace view public.validation_queue_items as
select
  vqa.id,
  vqa.documento_id,
  d.nombre as documento_nombre,
  d.expediente_id,
  e.titulo as expediente_titulo,
  e.despacho_id,
  vqa.assigned_to,
  vqa.status,
  vqa.priority_score,
  vqa.queue_reason,
  vqa.due_at,
  vqa.claimed_at,
  vqa.completed_at,
  vqa.created_at,
  vqa.updated_at,
  case
    when vqa.status <> 'done' and vqa.due_at is not null and now() > vqa.due_at then true
    else false
  end as is_sla_breached
from public.validation_queue_assignments vqa
join public.documentos d on d.id = vqa.documento_id
join public.expedientes e on e.id = d.expediente_id;

create or replace function public.claim_validation_queue_item(p_documento_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment_id uuid;
begin
  update public.validation_queue_assignments
  set
    assigned_to = auth.uid(),
    status = 'in_review',
    claimed_at = coalesce(claimed_at, now()),
    updated_at = now()
  where documento_id = p_documento_id
    and despacho_id = public.get_user_despacho_id()
    and status in ('queued', 'blocked')
  returning id into v_assignment_id;

  return v_assignment_id;
end;
$$;

grant execute on function public.claim_validation_queue_item(uuid) to authenticated;

insert into public.validation_queue_assignments (
  documento_id,
  despacho_id,
  assigned_to,
  status,
  priority_score,
  queue_reason,
  due_at
)
select
  d.id,
  e.despacho_id,
  null,
  'queued',
  100,
  'Extraccion lista para validacion humana',
  now() + interval '24 hours'
from public.documentos d
join public.expedientes e on e.id = d.expediente_id
where d.extraction_status = 'done'
  and d.extraction_report is not null
  and d.validado_at is null
on conflict (documento_id) do nothing;
