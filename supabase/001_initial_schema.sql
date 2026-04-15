-- ============================================
-- Ulpianito MVP - Initial Schema
-- Run this FIRST in Supabase SQL Editor
-- ============================================

create extension if not exists "uuid-ossp";

-- Despachos (law firms / organizations)
create table public.despachos (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  plan text not null default 'free',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  despacho_id uuid references public.despachos(id) on delete cascade not null,
  nombre text not null,
  apellido text not null,
  rol text not null default 'abogado',
  email text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Expedientes (legal cases)
create table public.expedientes (
  id uuid default uuid_generate_v4() primary key,
  despacho_id uuid references public.despachos(id) on delete cascade not null,
  created_by uuid references public.profiles(id) not null,
  numero_expediente text not null,
  titulo text not null,
  tipo text not null default 'facturacion',
  estado text not null default 'activo',
  descripcion text,
  notas text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Documentos (files attached to expedientes)
create table public.documentos (
  id uuid default uuid_generate_v4() primary key,
  expediente_id uuid references public.expedientes(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) not null,
  nombre text not null,
  storage_path text not null,
  tipo_documento text not null default 'otro',
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz default now() not null
);

-- Sujetos (parties involved in an expediente)
create table public.sujetos (
  id uuid default uuid_generate_v4() primary key,
  expediente_id uuid references public.expedientes(id) on delete cascade not null,
  nombre text not null,
  rol_procesal text not null,
  dni text,
  contacto text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Facturas (invoice data for the billing niche)
create table public.facturas (
  id uuid default uuid_generate_v4() primary key,
  expediente_id uuid references public.expedientes(id) on delete cascade not null,
  documento_id uuid references public.documentos(id) on delete set null,
  numero_factura text not null,
  emisor text not null,
  receptor text not null,
  fecha date not null,
  base_imponible numeric(12,2) not null default 0,
  iva numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  estado_validacion text not null default 'pendiente',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_profiles_despacho on public.profiles(despacho_id);
create index idx_expedientes_despacho on public.expedientes(despacho_id);
create index idx_expedientes_created_by on public.expedientes(created_by);
create index idx_documentos_expediente on public.documentos(expediente_id);
create index idx_sujetos_expediente on public.sujetos(expediente_id);
create index idx_facturas_expediente on public.facturas(expediente_id);
create index idx_facturas_documento on public.facturas(documento_id);

-- updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_updated_at before update on public.despachos
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.expedientes
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.sujetos
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.facturas
  for each row execute function public.handle_updated_at();

-- Auto-create profile + despacho on user signup
-- Reads nombre, apellido, nombre_despacho from auth.users.raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_despacho_id uuid;
begin
  insert into public.despachos (nombre)
  values (coalesce(new.raw_user_meta_data->>'nombre_despacho', 'Mi Despacho'))
  returning id into new_despacho_id;

  insert into public.profiles (id, despacho_id, nombre, apellido, email)
  values (
    new.id,
    new_despacho_id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'apellido', ''),
    coalesce(new.email, '')
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
