-- ============================================
-- Ulpianito - Vista 360° de Expedientes
-- Run AFTER 003_storage_buckets.sql
-- ============================================
-- Agrega dimensiones completas al expediente:
--   Metadatos ampliados, Eventos (timeline),
--   Activos (patrimonial), Fundamentos (normativa),
--   y Trazabilidad HITL en todas las tablas de contenido.
-- ============================================


-- =============================================
-- 1. ALTER expedientes: Metadatos ampliados + IA
-- =============================================

alter table public.expedientes
  add column if not exists jurisdiccion text,
  add column if not exists sede text,
  add column if not exists cuantia numeric(14,2),
  add column if not exists estado_procesal text not null default 'inicio',
  add column if not exists etiquetas text[] not null default '{}',
  add column if not exists ai_summary jsonb;

comment on column public.expedientes.jurisdiccion is 'Jurisdicción del caso (ej. Civil, Comercial, Penal)';
comment on column public.expedientes.sede is 'Órgano judicial concreto (ej. Juzgado Civil Nº 5 de CABA)';
comment on column public.expedientes.cuantia is 'Valor económico estimado del caso';
comment on column public.expedientes.estado_procesal is 'Fase procesal: inicio, demanda, contestacion, prueba, alegatos, sentencia, ejecucion, archivado';
comment on column public.expedientes.etiquetas is 'Tags de clasificación libre (ej. {sucesiones, urgente, familia})';
comment on column public.expedientes.ai_summary is 'Síntesis generada por IA (hechos, normas sugeridas, riesgos) pendiente de validación HITL';

-- Índice GIN para búsqueda eficiente por etiquetas
create index if not exists idx_expedientes_etiquetas on public.expedientes using gin (etiquetas);


-- =============================================
-- 2. ALTER sujetos: Roles ampliados + HITL
-- =============================================

alter table public.sujetos
  add column if not exists tipo_sujeto text not null default 'parte',
  add column if not exists email text,
  add column if not exists telefono text,
  add column if not exists notas text,
  add column if not exists origen text not null default 'manual',
  add column if not exists validado_por uuid references public.profiles(id) on delete set null,
  add column if not exists validado_at timestamptz;

comment on column public.sujetos.tipo_sujeto is 'Clasificación: parte, perito, testigo, notario, abogado_contrario, juez, mediador';
comment on column public.sujetos.origen is 'Procedencia del dato: manual | ia';
comment on column public.sujetos.validado_por is 'Profile que validó este registro en el flujo HITL';
comment on column public.sujetos.validado_at is 'Timestamp de validación HITL';


-- =============================================
-- 3. ALTER documentos: Trazabilidad HITL
-- =============================================

alter table public.documentos
  add column if not exists origen text not null default 'manual',
  add column if not exists validado_por uuid references public.profiles(id) on delete set null,
  add column if not exists validado_at timestamptz;


-- =============================================
-- 4. CREATE eventos (Timeline de hechos y plazos)
-- =============================================

create table public.eventos (
  id uuid default uuid_generate_v4() primary key,
  expediente_id uuid references public.expedientes(id) on delete cascade not null,
  created_by uuid references public.profiles(id) not null,
  tipo_evento text not null,
  titulo text not null,
  descripcion text,
  fecha_evento timestamptz not null,
  fecha_vencimiento timestamptz,
  completado boolean not null default false,
  origen text not null default 'manual',
  validado_por uuid references public.profiles(id) on delete set null,
  validado_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.eventos is 'Timeline cronológico del expediente: hechos, plazos legales, hitos y audiencias';
comment on column public.eventos.tipo_evento is 'hecho, plazo, hito, audiencia, notificacion, vencimiento';
comment on column public.eventos.fecha_evento is 'Fecha/hora del suceso o inicio del plazo';
comment on column public.eventos.fecha_vencimiento is 'Fecha límite (solo para plazos y vencimientos)';
comment on column public.eventos.completado is 'Marca si el plazo/hito fue cumplido';

create index idx_eventos_expediente on public.eventos(expediente_id);
create index idx_eventos_fecha on public.eventos(fecha_evento);
create index idx_eventos_vencimiento on public.eventos(fecha_vencimiento) where fecha_vencimiento is not null;

create trigger set_updated_at before update on public.eventos
  for each row execute function public.handle_updated_at();


-- =============================================
-- 5. CREATE activos (Patrimonio: bienes y deudas)
-- =============================================

create table public.activos (
  id uuid default uuid_generate_v4() primary key,
  expediente_id uuid references public.expedientes(id) on delete cascade not null,
  created_by uuid references public.profiles(id) not null,
  tipo text not null,
  categoria text not null,
  descripcion text not null,
  valor_estimado numeric(14,2),
  moneda text not null default 'ARS',
  referencia_registral text,
  notas text,
  origen text not null default 'manual',
  validado_por uuid references public.profiles(id) on delete set null,
  validado_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.activos is 'Dimensión patrimonial: bienes, créditos, deudas e inmuebles vinculados al expediente';
comment on column public.activos.tipo is 'activo | pasivo';
comment on column public.activos.categoria is 'inmueble, vehiculo, cuenta_bancaria, inversion, credito, deuda, honorarios, otro';
comment on column public.activos.referencia_registral is 'Matrícula, patente, CBU u otro identificador registral';

create index idx_activos_expediente on public.activos(expediente_id);
create index idx_activos_tipo on public.activos(tipo);

create trigger set_updated_at before update on public.activos
  for each row execute function public.handle_updated_at();


-- =============================================
-- 6. CREATE fundamentos (Normativa y jurisprudencia)
-- =============================================

create table public.fundamentos (
  id uuid default uuid_generate_v4() primary key,
  expediente_id uuid references public.expedientes(id) on delete cascade not null,
  created_by uuid references public.profiles(id) not null,
  tipo text not null,
  norma text not null,
  articulo text,
  descripcion text,
  url text,
  origen text not null default 'manual',
  validado_por uuid references public.profiles(id) on delete set null,
  validado_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.fundamentos is 'Base jurídica: leyes, artículos, decretos y jurisprudencia vinculados al expediente';
comment on column public.fundamentos.tipo is 'articulo, ley, decreto, resolucion, jurisprudencia, doctrina';
comment on column public.fundamentos.norma is 'Cuerpo normativo (ej. Código Civil y Comercial, Ley 24.240)';
comment on column public.fundamentos.articulo is 'Artículo específico (ej. Art. 1078)';
comment on column public.fundamentos.url is 'Link a fuente oficial o texto completo';

create index idx_fundamentos_expediente on public.fundamentos(expediente_id);
create index idx_fundamentos_tipo on public.fundamentos(tipo);

create trigger set_updated_at before update on public.fundamentos
  for each row execute function public.handle_updated_at();


-- =============================================
-- 7. RLS para las nuevas tablas
-- =============================================

alter table public.eventos enable row level security;
alter table public.activos enable row level security;
alter table public.fundamentos enable row level security;

-- Eventos: miembros del despacho pueden ver/editar eventos de sus expedientes
create policy "Eventos: select by despacho"
  on public.eventos for select
  using (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Eventos: insert by despacho"
  on public.eventos for insert
  with check (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Eventos: update by despacho"
  on public.eventos for update
  using (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Eventos: delete by despacho"
  on public.eventos for delete
  using (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

-- Activos: mismo patrón de RLS por despacho
create policy "Activos: select by despacho"
  on public.activos for select
  using (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Activos: insert by despacho"
  on public.activos for insert
  with check (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Activos: update by despacho"
  on public.activos for update
  using (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Activos: delete by despacho"
  on public.activos for delete
  using (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

-- Fundamentos: mismo patrón de RLS por despacho
create policy "Fundamentos: select by despacho"
  on public.fundamentos for select
  using (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Fundamentos: insert by despacho"
  on public.fundamentos for insert
  with check (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Fundamentos: update by despacho"
  on public.fundamentos for update
  using (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );

create policy "Fundamentos: delete by despacho"
  on public.fundamentos for delete
  using (
    expediente_id in (
      select id from public.expedientes where despacho_id = public.get_user_despacho_id()
    )
  );
