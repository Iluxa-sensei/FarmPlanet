-- OrbiView Supabase schema
-- Apply in Supabase SQL editor or via CLI: supabase db reset --linked

-- Use the public schema for app data
create schema if not exists public;
alter schema public owner to postgres;

-- Enable required extensions (uuid/ossp for deterministic uuids if needed)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- USERS & PROFILES ---------------------------------------------------------

-- profiles: 1:1 to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create unique index if not exists profiles_email_key on public.profiles (email);

-- Keep email in sync with auth.users
create or replace function public.handle_user_created()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', null), coalesce(new.raw_user_meta_data->>'avatar_url', null))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_user_created();

create or replace function public.handle_profile_updated()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_profile_updated();

-- SETTINGS -----------------------------------------------------------------

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'system' check (theme in ('light','dark','system')),
  notifications_enabled boolean default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

drop trigger if exists on_user_settings_updated on public.user_settings;
create trigger on_user_settings_updated
  before update on public.user_settings
  for each row execute function public.handle_profile_updated();

-- ALERTS -------------------------------------------------------------------

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text,
  severity text not null check (severity in ('info','warning','critical')),
  is_read boolean default false,
  created_at timestamp with time zone default now() not null
);

create index if not exists alerts_user_id_idx on public.alerts (user_id);

-- SAVED VIEWS --------------------------------------------------------------

create table if not exists public.saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create index if not exists saved_views_user_id_idx on public.saved_views (user_id);

drop trigger if exists on_saved_views_updated on public.saved_views;
create trigger on_saved_views_updated
  before update on public.saved_views
  for each row execute function public.handle_profile_updated();

-- DATA LAYERS (e.g., NDVI, temperature overlays) --------------------------

create table if not exists public.data_layers (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  source_url text,
  is_public boolean default true,
  created_at timestamp with time zone default now() not null
);

-- USER <-> LAYER preferences (visibility, opacity, etc.) -------------------

create table if not exists public.user_layer_prefs (
  user_id uuid not null references auth.users(id) on delete cascade,
  layer_id uuid not null references public.data_layers(id) on delete cascade,
  visible boolean default true,
  opacity numeric(3,2) default 1.00 check (opacity >= 0 and opacity <= 1),
  order_index int default 0,
  primary key (user_id, layer_id)
);

create index if not exists user_layer_prefs_user_idx on public.user_layer_prefs (user_id);

-- RLS POLICIES -------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.alerts enable row level security;
alter table public.saved_views enable row level security;
alter table public.user_layer_prefs enable row level security;

-- Profiles: users can read/update their own profile
drop policy if exists "Profiles are viewable by self" on public.profiles;
create policy "Profiles are viewable by self" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles are updatable by self" on public.profiles;
create policy "Profiles are updatable by self" on public.profiles
  for update using (auth.uid() = id);

-- User settings: only owner can select/insert/update
drop policy if exists "Settings owner select" on public.user_settings;
create policy "Settings owner select" on public.user_settings
  for select using (auth.uid() = user_id);

drop policy if exists "Settings owner insert" on public.user_settings;
create policy "Settings owner insert" on public.user_settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "Settings owner update" on public.user_settings;
create policy "Settings owner update" on public.user_settings
  for update using (auth.uid() = user_id);

-- Alerts: only owner can select/insert/update
drop policy if exists "Alerts owner select" on public.alerts;
create policy "Alerts owner select" on public.alerts
  for select using (auth.uid() = user_id);

drop policy if exists "Alerts owner insert" on public.alerts;
create policy "Alerts owner insert" on public.alerts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Alerts owner update" on public.alerts;
create policy "Alerts owner update" on public.alerts
  for update using (auth.uid() = user_id);

-- Saved views: only owner can select/insert/update/delete
drop policy if exists "Saved views owner select" on public.saved_views;
create policy "Saved views owner select" on public.saved_views
  for select using (auth.uid() = user_id);

drop policy if exists "Saved views owner insert" on public.saved_views;
create policy "Saved views owner insert" on public.saved_views
  for insert with check (auth.uid() = user_id);

drop policy if exists "Saved views owner update" on public.saved_views;
create policy "Saved views owner update" on public.saved_views
  for update using (auth.uid() = user_id);

drop policy if exists "Saved views owner delete" on public.saved_views;
create policy "Saved views owner delete" on public.saved_views
  for delete using (auth.uid() = user_id);

-- User layer prefs: only owner can select/insert/update/delete
drop policy if exists "Layer prefs owner select" on public.user_layer_prefs;
create policy "Layer prefs owner select" on public.user_layer_prefs
  for select using (auth.uid() = user_id);

drop policy if exists "Layer prefs owner insert" on public.user_layer_prefs;
create policy "Layer prefs owner insert" on public.user_layer_prefs
  for insert with check (auth.uid() = user_id);

drop policy if exists "Layer prefs owner update" on public.user_layer_prefs;
create policy "Layer prefs owner update" on public.user_layer_prefs
  for update using (auth.uid() = user_id);

drop policy if exists "Layer prefs owner delete" on public.user_layer_prefs;
create policy "Layer prefs owner delete" on public.user_layer_prefs
  for delete using (auth.uid() = user_id);

-- Minimal public data: data_layers is public readable
alter table public.data_layers enable row level security;
drop policy if exists "Public can read layers" on public.data_layers;
create policy "Public can read layers" on public.data_layers
  for select using (true);

-- DONE ---------------------------------------------------------------------


