-- ============================================
-- Ulpianito - Ius: roles, economía, misiones, quizzes
-- Run AFTER 004_expedientes_detalle_360.sql
-- ============================================

-- --------------------------------------------
-- 1. Roles: normalizar a admin | jurista (+ legacy)
-- --------------------------------------------
update public.profiles
set rol = 'jurista'
where lower(rol) in ('abogado', 'jurista');

alter table public.profiles
  alter column rol set default 'jurista';

comment on column public.profiles.rol is 'Rol de aplicación: admin, jurista (extensible: mentor, jurisconsulto, ...)';

-- --------------------------------------------
-- 2. Helpers de autorización
-- --------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(trim(p.rol)) = 'admin'
  );
$$;

comment on function public.is_admin() is 'True si el usuario actual tiene rol admin';

grant execute on function public.is_admin() to authenticated;


-- --------------------------------------------
-- 3. Economía IUS: reglas, ledger, wallets
-- --------------------------------------------
create table public.ius_reward_rules (
  id uuid default uuid_generate_v4() primary key,
  action_key text not null unique,
  description text,
  amount bigint not null check (amount >= 0),
  active boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ius_reward_rules is 'Reglas de recompensa IUS por tipo de acción (clave estable para código)';

create trigger set_updated_at_ius_reward_rules
  before update on public.ius_reward_rules
  for each row execute function public.handle_updated_at();

create table public.ius_wallets (
  profile_id uuid references public.profiles(id) on delete cascade primary key,
  despacho_id uuid references public.despachos(id) on delete cascade not null,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.ius_wallets is 'Saldo acumulado IUS por usuario';

create index idx_ius_wallets_despacho on public.ius_wallets(despacho_id);

create trigger set_updated_at_ius_wallets
  before update on public.ius_wallets
  for each row execute function public.handle_updated_at();

create table public.ius_ledger (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  despacho_id uuid references public.despachos(id) on delete cascade not null,
  delta bigint not null,
  reason text not null,
  ref_type text,
  ref_id uuid,
  idempotency_key text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

comment on table public.ius_ledger is 'Movimientos inmutables de IUS (auditoría)';

create index idx_ius_ledger_profile on public.ius_ledger(profile_id, created_at desc);
create index idx_ius_ledger_despacho on public.ius_ledger(despacho_id);
create unique index uq_ius_ledger_idempotency
  on public.ius_ledger(idempotency_key)
  where idempotency_key is not null;

-- Sincronizar balance al insertar en ledger
create or replace function public.ius_ledger_apply_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ius_wallets (profile_id, despacho_id, balance)
  values (new.profile_id, new.despacho_id, greatest(0, new.delta))
  on conflict (profile_id) do update
    set balance = greatest(0, public.ius_wallets.balance + new.delta),
        updated_at = now();
  return new;
end;
$$;

create trigger trg_ius_ledger_apply_balance
  after insert on public.ius_ledger
  for each row execute function public.ius_ledger_apply_balance();

-- Seed de reglas por defecto
insert into public.ius_reward_rules (action_key, description, amount, active)
values
  ('quiz_passed', 'Quiz aprobado (umbral configurable en app)', 25, true),
  ('mission_step_extract', 'Misión: extracción semántica completada', 15, true),
  ('mission_step_hitl', 'Misión: validación HITL aprobada', 30, true),
  ('mission_step_plan_write', 'Misión: planificación y borrador generados', 20, true),
  ('mission_training_approved', 'Misión: revisión de entrenamiento aprobada (admin)', 40, true)
on conflict (action_key) do nothing;

-- Asegurar wallet al crear perfil (fallback si trigger de auth no corre en migraciones antiguas)
create or replace function public.ensure_ius_wallet_for_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ius_wallets (profile_id, despacho_id)
  values (new.id, new.despacho_id)
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

create trigger trg_profiles_ensure_ius_wallet
  after insert on public.profiles
  for each row execute function public.ensure_ius_wallet_for_profile();

-- Wallets para perfiles existentes
insert into public.ius_wallets (profile_id, despacho_id)
select p.id, p.despacho_id from public.profiles p
on conflict (profile_id) do nothing;


-- --------------------------------------------
-- 4. Misiones y workflow Ius
-- --------------------------------------------
create table public.missions (
  id uuid default uuid_generate_v4() primary key,
  despacho_id uuid references public.despachos(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  mission_type text not null default 'campamento',
  status text not null default 'activa',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index uq_missions_global_slug on public.missions(slug) where despacho_id is null;
create unique index uq_missions_despacho_slug on public.missions(despacho_id, slug) where despacho_id is not null;

comment on table public.missions is 'Definición de misiones gamificadas; despacho_id null = plantilla global';

create index idx_missions_despacho on public.missions(despacho_id);

create trigger set_updated_at_missions
  before update on public.missions
  for each row execute function public.handle_updated_at();

create table public.mission_runs (
  id uuid default uuid_generate_v4() primary key,
  mission_id uuid references public.missions(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  despacho_id uuid references public.despachos(id) on delete cascade not null,
  expediente_id uuid references public.expedientes(id) on delete set null,
  documento_id uuid references public.documentos(id) on delete set null,
  current_step text not null default 'extract',
  status text not null default 'draft',
  context_artifact jsonb not null default '{}',
  extractor_output jsonb,
  validator_output jsonb,
  planner_output jsonb,
  writer_output jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.mission_runs.current_step is 'extract | hitl | plan_write | training_review | done';
comment on column public.mission_runs.status is 'draft | running | needs_human | completed | failed | training_pending | training_done';

create index idx_mission_runs_profile on public.mission_runs(profile_id);
create index idx_mission_runs_mission on public.mission_runs(mission_id);
create index idx_mission_runs_despacho on public.mission_runs(despacho_id);

create trigger set_updated_at_mission_runs
  before update on public.mission_runs
  for each row execute function public.handle_updated_at();

create table public.mission_step_events (
  id uuid default uuid_generate_v4() primary key,
  run_id uuid references public.mission_runs(id) on delete cascade not null,
  step_key text not null,
  level text not null default 'info',
  message text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_mission_step_events_run on public.mission_step_events(run_id, created_at);

create table public.hitl_reviews (
  id uuid default uuid_generate_v4() primary key,
  run_id uuid references public.mission_runs(id) on delete cascade not null,
  reviewed_by uuid references public.profiles(id) on delete set null not null,
  action text not null,
  entity_mapping jsonb not null default '{}',
  risk_acknowledged boolean not null default false,
  economic_alert_notes text,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.hitl_reviews is 'Auditoría HITL: curación de entidades y confirmación de riesgos';

create index idx_hitl_reviews_run on public.hitl_reviews(run_id);

create table public.training_reviews (
  id uuid default uuid_generate_v4() primary key,
  run_id uuid references public.mission_runs(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete set null not null,
  understood_sublicense_trap boolean,
  comments text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.training_reviews is 'Revisión pedagógica por ADMIN (mentor futuro)';

create unique index uq_training_reviews_run on public.training_reviews(run_id);

create trigger set_updated_at_training_reviews
  before update on public.training_reviews
  for each row execute function public.handle_updated_at();


-- --------------------------------------------
-- 5. Quizzes
-- --------------------------------------------
create table public.quizzes (
  id uuid default uuid_generate_v4() primary key,
  despacho_id uuid references public.despachos(id) on delete cascade not null,
  expediente_id uuid references public.expedientes(id) on delete set null,
  documento_id uuid references public.documentos(id) on delete set null,
  title text not null,
  source_label text,
  created_by uuid references public.profiles(id) on delete set null not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_quizzes_despacho on public.quizzes(despacho_id);

create trigger set_updated_at_quizzes
  before update on public.quizzes
  for each row execute function public.handle_updated_at();

create table public.quiz_questions (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  orden int not null default 0,
  question text not null,
  options jsonb not null,
  correct_index int not null,
  explanation text
);

create index idx_quiz_questions_quiz on public.quiz_questions(quiz_id);

create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  score_pct numeric(5,2),
  passed boolean not null default false,
  completed_at timestamptz,
  rewarded_at timestamptz,
  idempotency_reward_key text,
  created_at timestamptz not null default now()
);

create index idx_quiz_attempts_profile on public.quiz_attempts(profile_id);
create unique index uq_quiz_attempts_reward
  on public.quiz_attempts(idempotency_reward_key)
  where idempotency_reward_key is not null;

create table public.quiz_attempt_answers (
  id uuid default uuid_generate_v4() primary key,
  attempt_id uuid references public.quiz_attempts(id) on delete cascade not null,
  question_id uuid references public.quiz_questions(id) on delete cascade not null,
  selected_index int not null
);

create index idx_quiz_attempt_answers_attempt on public.quiz_attempt_answers(attempt_id);


-- --------------------------------------------
-- 6. RPC: recompensas IUS (idempotentes)
-- --------------------------------------------
create or replace function public.get_ius_rule_amount(p_action_key text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select amount from public.ius_reward_rules where action_key = p_action_key and active limit 1),
    0::bigint
  );
$$;

create or replace function public.grant_ius_reward(
  p_profile_id uuid,
  p_despacho_id uuid,
  p_action_key text,
  p_ref_type text,
  p_ref_id uuid,
  p_meta jsonb default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount bigint;
  v_idem text;
  v_ledger_id uuid;
begin
  -- Solo service_role, admin, o el propio usuario (para claims internos)
  if auth.role() is distinct from 'service_role' then
    if not public.is_admin() and p_profile_id is distinct from auth.uid() then
      raise exception 'grant_ius_reward: no autorizado';
    end if;
  end if;

  v_amount := public.get_ius_rule_amount(p_action_key);
  if v_amount <= 0 then
    return null;
  end if;

  v_idem := coalesce(p_ref_type, 'none') || ':' || coalesce(p_ref_id::text, '') || ':' || p_action_key;

  insert into public.ius_ledger (
    profile_id, despacho_id, delta, reason, ref_type, ref_id, idempotency_key, meta
  )
  values (
    p_profile_id,
    p_despacho_id,
    v_amount,
    p_action_key,
    p_ref_type,
    p_ref_id,
    v_idem,
    coalesce(p_meta, '{}'::jsonb)
  )
  returning id into v_ledger_id;

  return v_ledger_id;
exception
  when unique_violation then
    return null;
end;
$$;

comment on function public.grant_ius_reward is 'Otorga IUS (idempotente). Uso: service_role, admin o self+claim.';

revoke all on function public.grant_ius_reward(uuid, uuid, text, text, uuid, jsonb) from public;
grant execute on function public.grant_ius_reward(uuid, uuid, text, text, uuid, jsonb) to service_role;


-- Claim seguro: recompensa por quiz aprobado (llama grant como el mismo usuario)
create or replace function public.claim_quiz_pass_reward(p_attempt_id uuid)
returns uuid
language sql
security definer
set search_path = public
as $claim$
  with attempt as (
    select
      a.id,
      a.profile_id,
      a.quiz_id,
      a.passed,
      a.rewarded_at,
      a.score_pct
    from public.quiz_attempts a
    where a.id = p_attempt_id
  ),
  eligible as (
    select
      a.id,
      a.profile_id,
      q.despacho_id,
      a.score_pct
    from attempt a
    join public.quizzes q on q.id = a.quiz_id
    where a.profile_id = auth.uid()
      and coalesce(a.passed, false)
      and a.rewarded_at is null
  ),
  reward as (
    select
      public.grant_ius_reward(
        e.profile_id,
        e.despacho_id,
        'quiz_passed',
        'quiz_attempt',
        e.id,
        jsonb_build_object('score_pct', e.score_pct)
      ) as ledger_id
    from eligible e
  ),
  mark as (
    update public.quiz_attempts qa
    set rewarded_at = now()
    where qa.id = p_attempt_id
      and exists (
        select 1 from reward r where r.ledger_id is not null
      )
    returning qa.id
  )
  select r.ledger_id
  from reward r
  limit 1;
$claim$;

grant execute on function public.claim_quiz_pass_reward(uuid) to authenticated;


-- Claim por paso de misión (validación en app antes de llamar)
create or replace function public.claim_mission_step_reward(
  p_run_id uuid,
  p_action_key text
)
returns uuid
language sql
security definer
set search_path = public
as $claim$
  with valid_action as (
    select p_action_key as action_key
    where p_action_key in (
      'mission_step_extract',
      'mission_step_hitl',
      'mission_step_plan_write',
      'mission_training_approved'
    )
  ),
  eligible_run as (
    select
      r.id,
      r.profile_id,
      r.despacho_id
    from public.mission_runs r
    join valid_action va on true
    where r.id = p_run_id
      and (
        r.profile_id = auth.uid()
        or public.is_admin()
      )
  )
  select public.grant_ius_reward(
    er.profile_id,
    er.despacho_id,
    p_action_key,
    'mission_run',
    p_run_id,
    jsonb_build_object('step', p_action_key)
  )
  from eligible_run er
  limit 1;
$claim$;

grant execute on function public.claim_mission_step_reward(uuid, text) to authenticated;


-- --------------------------------------------
-- 7. RLS
-- --------------------------------------------
alter table public.ius_reward_rules enable row level security;
alter table public.ius_wallets enable row level security;
alter table public.ius_ledger enable row level security;
alter table public.missions enable row level security;
alter table public.mission_runs enable row level security;
alter table public.mission_step_events enable row level security;
alter table public.hitl_reviews enable row level security;
alter table public.training_reviews enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;

-- Reglas de recompensa: lectura para autenticados; escritura solo admin (manual)
create policy "ius_reward_rules_select"
  on public.ius_reward_rules for select
  to authenticated
  using (true);

create policy "ius_reward_rules_admin_all"
  on public.ius_reward_rules for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Wallets: propio despacho
create policy "ius_wallets_select_own_or_despacho"
  on public.ius_wallets for select
  to authenticated
  using (
    profile_id = auth.uid()
    or despacho_id = public.get_user_despacho_id()
  );

-- Ledger: ver propias filas o compañeros de despacho (transparencia interna)
create policy "ius_ledger_select_despacho"
  on public.ius_ledger for select
  to authenticated
  using (
    despacho_id = public.get_user_despacho_id()
  );

-- Sin insert/update/delete directo desde cliente (solo RPC/triggers internos)
-- service_role bypasses RLS for edge functions

-- Missions: plantilla global (despacho null) o del despacho
create policy "missions_select"
  on public.missions for select
  to authenticated
  using (
    despacho_id is null
    or despacho_id = public.get_user_despacho_id()
  );

create policy "missions_admin_write"
  on public.missions for insert
  to authenticated
  with check (
    public.is_admin()
    and (despacho_id is null or despacho_id = public.get_user_despacho_id())
  );

create policy "missions_admin_update"
  on public.missions for update
  to authenticated
  using (
    public.is_admin() and (despacho_id is null or despacho_id = public.get_user_despacho_id())
  );

create policy "missions_admin_delete"
  on public.missions for delete
  to authenticated
  using (
    public.is_admin()
    and (despacho_id is null or despacho_id = public.get_user_despacho_id())
  );

-- Mission runs
create policy "mission_runs_select_own_despacho"
  on public.mission_runs for select
  to authenticated
  using (despacho_id = public.get_user_despacho_id());

create policy "mission_runs_insert_own"
  on public.mission_runs for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and despacho_id = public.get_user_despacho_id()
  );

create policy "mission_runs_update_own"
  on public.mission_runs for update
  to authenticated
  using (
    despacho_id = public.get_user_despacho_id()
    and (profile_id = auth.uid() or public.is_admin())
  );

create policy "mission_runs_delete_own_or_admin"
  on public.mission_runs for delete
  to authenticated
  using (
    public.is_admin()
    or (despacho_id = public.get_user_despacho_id() and profile_id = auth.uid())
  );

-- Step events
create policy "mission_step_events_select"
  on public.mission_step_events for select
  to authenticated
  using (
    exists (
      select 1 from public.mission_runs r
      where r.id = mission_step_events.run_id
        and r.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "mission_step_events_insert"
  on public.mission_step_events for insert
  to authenticated
  with check (
    exists (
      select 1 from public.mission_runs r
      where r.id = mission_step_events.run_id
        and r.despacho_id = public.get_user_despacho_id()
        and (r.profile_id = auth.uid() or public.is_admin())
    )
  );

-- HITL
create policy "hitl_reviews_select"
  on public.hitl_reviews for select
  to authenticated
  using (
    exists (
      select 1 from public.mission_runs r
      where r.id = hitl_reviews.run_id
        and r.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "hitl_reviews_insert"
  on public.hitl_reviews for insert
  to authenticated
  with check (
    reviewed_by = auth.uid()
    and exists (
      select 1 from public.mission_runs r
      where r.id = hitl_reviews.run_id
        and r.despacho_id = public.get_user_despacho_id()
        and r.profile_id = auth.uid()
    )
  );

-- Training: solo admin insert/update; lectura del run en despacho
create policy "training_reviews_select"
  on public.training_reviews for select
  to authenticated
  using (
    exists (
      select 1 from public.mission_runs r
      where r.id = training_reviews.run_id
        and r.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "training_reviews_admin_write"
  on public.training_reviews for insert
  to authenticated
  with check (
    public.is_admin()
    and reviewer_id = auth.uid()
    and exists (
      select 1 from public.mission_runs r
      where r.id = training_reviews.run_id
        and r.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "training_reviews_admin_update"
  on public.training_reviews for update
  to authenticated
  using (public.is_admin() and reviewer_id = auth.uid())
  with check (public.is_admin() and reviewer_id = auth.uid());

-- Quizzes
create policy "quizzes_select_despacho"
  on public.quizzes for select
  to authenticated
  using (despacho_id = public.get_user_despacho_id());

create policy "quizzes_insert_despacho"
  on public.quizzes for insert
  to authenticated
  with check (
    despacho_id = public.get_user_despacho_id()
    and created_by = auth.uid()
  );

create policy "quizzes_update_despacho"
  on public.quizzes for update
  to authenticated
  using (despacho_id = public.get_user_despacho_id());

create policy "quizzes_delete_admin"
  on public.quizzes for delete
  to authenticated
  using (despacho_id = public.get_user_despacho_id() and public.is_admin());

-- Quiz questions
create policy "quiz_questions_select"
  on public.quiz_questions for select
  to authenticated
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_questions.quiz_id
        and q.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "quiz_questions_write"
  on public.quiz_questions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_questions.quiz_id
        and q.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "quiz_questions_update"
  on public.quiz_questions for update
  to authenticated
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_questions.quiz_id
        and q.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "quiz_questions_delete"
  on public.quiz_questions for delete
  to authenticated
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_questions.quiz_id
        and q.despacho_id = public.get_user_despacho_id()
        and (q.created_by = auth.uid() or public.is_admin())
    )
  );

-- Attempts
create policy "quiz_attempts_select_own"
  on public.quiz_attempts for select
  to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.quizzes q
      where q.id = quiz_attempts.quiz_id
        and q.despacho_id = public.get_user_despacho_id()
        and public.is_admin()
    )
  );

create policy "quiz_attempts_insert_own"
  on public.quiz_attempts for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.quizzes q
      where q.id = quiz_attempts.quiz_id
        and q.despacho_id = public.get_user_despacho_id()
    )
  );

create policy "quiz_attempts_update_own"
  on public.quiz_attempts for update
  to authenticated
  using (profile_id = auth.uid());

-- Answers
create policy "quiz_attempt_answers_select"
  on public.quiz_attempt_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.quiz_attempts a
      join public.quizzes q on q.id = a.quiz_id
      where a.id = quiz_attempt_answers.attempt_id
        and q.despacho_id = public.get_user_despacho_id()
        and (a.profile_id = auth.uid() or public.is_admin())
    )
  );

create policy "quiz_attempt_answers_insert"
  on public.quiz_attempt_answers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.quiz_attempts a
      join public.quizzes q on q.id = a.quiz_id
      where a.id = quiz_attempt_answers.attempt_id
        and a.profile_id = auth.uid()
        and q.despacho_id = public.get_user_despacho_id()
    )
  );

-- ============================================
-- 8. Seed: misión plantilla global Ius
-- ============================================
insert into public.missions (despacho_id, slug, title, description, mission_type, status)
select
  null,
  'campamento-licencia',
  'Campamento: licencia y contratos',
  'Flujo Ius: extracción semántica, validación HITL, planificación y borrador, revisión de entrenamiento (ADMIN).',
  'campamento',
  'activa'
where not exists (
  select 1 from public.missions m
  where m.slug = 'campamento-licencia' and m.despacho_id is null
);
