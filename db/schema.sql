-- SignalX Supabase schema
-- Run this in the Supabase SQL editor or your PostgreSQL database.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade unique,
  user_id uuid not null references public.users(id) on delete cascade,
  source text not null,
  location_name text,
  latitude double precision,
  longitude double precision,
  risk text not null,
  summary text not null,
  temperature numeric,
  precipitation numeric,
  humidity numeric,
  wind_speed numeric,
  raw_data jsonb,
  parsed_data jsonb,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade unique,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  explanation text not null,
  suggested_action text not null,
  confidence numeric not null default 0,
  impact text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  message text not null,
  priority text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_user_created_at on public.events(user_id, created_at desc);
create index if not exists idx_events_status_created_at on public.events(status, created_at asc);
create index if not exists idx_signals_user_created_at on public.signals(user_id, created_at desc);
create index if not exists idx_signals_risk_created_at on public.signals(risk, created_at desc);
create index if not exists idx_insights_user_created_at on public.insights(user_id, created_at desc);
create index if not exists idx_alerts_user_created_at on public.alerts(user_id, created_at desc);
create index if not exists idx_alerts_resolved_created_at on public.alerts(user_id, resolved, created_at desc);

-- Analytics helper functions for dashboard queries
create or replace function public.analytics_summary(p_user_id uuid)
returns table(
  total_signals bigint,
  high_risk bigint,
  medium_risk bigint,
  low_risk bigint,
  active_alerts bigint
)
language sql stable as $$
  select
    (select count(*) from public.signals where user_id = p_user_id) as total_signals,
    (select count(*) from public.signals where user_id = p_user_id and risk = 'HIGH') as high_risk,
    (select count(*) from public.signals where user_id = p_user_id and risk = 'MEDIUM') as medium_risk,
    (select count(*) from public.signals where user_id = p_user_id and risk = 'LOW') as low_risk,
    (select count(*) from public.alerts where user_id = p_user_id and resolved = false) as active_alerts;
$$;

create or replace function public.signals_trend(p_user_id uuid, p_days int default 7)
returns table(day text, total int)
language sql stable as $$
  select to_char(created_at::date, 'YYYY-MM-DD') as day, count(*)
  from public.signals
  where user_id = p_user_id and created_at >= now() - make_interval(days => p_days)
  group by day
  order by day;
$$;
