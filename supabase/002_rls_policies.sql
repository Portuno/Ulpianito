-- ============================================
-- Ulpianito MVP - Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================

-- Enable RLS on all tables
alter table public.despachos enable row level security;
alter table public.profiles enable row level security;
alter table public.expedientes enable row level security;
alter table public.documentos enable row level security;
alter table public.sujetos enable row level security;
alter table public.facturas enable row level security;

-- Helper: get the despacho_id for the current authenticated user
create or replace function public.get_user_despacho_id()
returns uuid as $$
  select despacho_id from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- ==================
-- DESPACHOS policies
-- ==================
create policy "Users can view their own despacho"
  on public.despachos for select
  using (id = public.get_user_despacho_id());

create policy "Users can update their own despacho"
  on public.despachos for update
  using (id = public.get_user_despacho_id());

-- ==================
-- PROFILES policies
-- ==================
create policy "Users can view profiles in their despacho"
  on public.profiles for select
  using (despacho_id = public.get_user_despacho_id());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- ======================
-- EXPEDIENTES policies
-- ======================
create policy "Users can view expedientes in their despacho"
  on public.expedientes for select
  using (despacho_id = public.get_user_despacho_id());

create policy "Users can create expedientes in their despacho"
  on public.expedientes for insert
  with check (despacho_id = public.get_user_despacho_id());

create policy "Users can update expedientes in their despacho"
  on public.expedientes for update
  using (despacho_id = public.get_user_despacho_id());

create policy "Users can delete expedientes in their despacho"
  on public.expedientes for delete
  using (despacho_id = public.get_user_despacho_id());

-- ====================
-- DOCUMENTOS policies
-- ====================
create policy "Users can view documentos in their despacho"
  on public.documentos for select
  using (
    exists (
      select 1 from public.expedientes
      where expedientes.id = documentos.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Users can upload documentos in their despacho"
  on public.documentos for insert
  with check (
    exists (
      select 1 from public.expedientes
      where expedientes.id = documentos.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Users can delete documentos in their despacho"
  on public.documentos for delete
  using (
    exists (
      select 1 from public.expedientes
      where expedientes.id = documentos.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

-- ==================
-- SUJETOS policies
-- ==================
create policy "Users can view sujetos in their despacho"
  on public.sujetos for select
  using (
    exists (
      select 1 from public.expedientes
      where expedientes.id = sujetos.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Users can create sujetos in their despacho"
  on public.sujetos for insert
  with check (
    exists (
      select 1 from public.expedientes
      where expedientes.id = sujetos.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Users can update sujetos in their despacho"
  on public.sujetos for update
  using (
    exists (
      select 1 from public.expedientes
      where expedientes.id = sujetos.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Users can delete sujetos in their despacho"
  on public.sujetos for delete
  using (
    exists (
      select 1 from public.expedientes
      where expedientes.id = sujetos.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

-- ==================
-- FACTURAS policies
-- ==================
create policy "Users can view facturas in their despacho"
  on public.facturas for select
  using (
    exists (
      select 1 from public.expedientes
      where expedientes.id = facturas.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Users can create facturas in their despacho"
  on public.facturas for insert
  with check (
    exists (
      select 1 from public.expedientes
      where expedientes.id = facturas.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Users can update facturas in their despacho"
  on public.facturas for update
  using (
    exists (
      select 1 from public.expedientes
      where expedientes.id = facturas.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Users can delete facturas in their despacho"
  on public.facturas for delete
  using (
    exists (
      select 1 from public.expedientes
      where expedientes.id = facturas.expediente_id
      and expedientes.despacho_id = public.get_user_despacho_id()
    )
  );
