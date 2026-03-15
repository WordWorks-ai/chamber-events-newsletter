create extension if not exists pgcrypto;

create table if not exists public.chambers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  website_url text not null,
  events_url text not null,
  platform_hint text null,
  active boolean not null default true,
  default_timezone text not null default 'America/New_York',
  logo_url text null,
  favicon_url text null,
  theme_color text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scrape_cache (
  chamber_id uuid not null references public.chambers(id) on delete cascade,
  cache_key text not null,
  normalized_events jsonb not null,
  branding jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  source_hash text null,
  primary key (chamber_id, cache_key)
);

create table if not exists public.newsletter_runs (
  id uuid primary key default gen_random_uuid(),
  chamber_id uuid not null references public.chambers(id) on delete cascade,
  status text not null,
  event_count integer not null default 0,
  request_payload jsonb not null,
  output_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.chambers enable row level security;
alter table public.scrape_cache enable row level security;
alter table public.newsletter_runs enable row level security;

create policy "Service role full access on chambers"
  on public.chambers for all
  using (current_setting('role') = 'service_role');

create policy "Service role full access on scrape_cache"
  on public.scrape_cache for all
  using (current_setting('role') = 'service_role');

create policy "Service role full access on newsletter_runs"
  on public.newsletter_runs for all
  using (current_setting('role') = 'service_role');

create index if not exists chambers_active_name_idx on public.chambers (active, name);
create index if not exists chambers_slug_idx on public.chambers (slug);
create index if not exists scrape_cache_expiry_idx on public.scrape_cache (expires_at);
create index if not exists newsletter_runs_chamber_created_idx on public.newsletter_runs (chamber_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists chambers_set_updated_at on public.chambers;
create trigger chambers_set_updated_at
before update on public.chambers
for each row
execute function public.set_updated_at();
