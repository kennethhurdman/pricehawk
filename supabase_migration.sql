-- ============================================================
-- PriceHawk — Supabase SQL Migration
-- Run this ONCE in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Enable the uuid extension (already on by default in Supabase)
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- One row per authenticated user. Created on first sign-up.
-- ============================================================
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text        not null,
  tier                 text        not null default 'FREE' check (tier in ('FREE','PREMIUM')),
  email_tokens         int         not null default 5,
  selected_categories  text[]      not null default '{}',
  premium_active_until timestamptz,
  created_at           timestamptz not null default now()
);

-- Allow users to read/update their own profile only
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- TABLE: tracked_items
-- One row per item a user is tracking.
-- ============================================================
create table if not exists public.tracked_items (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  category      text        not null check (category in ('FLIGHT','HOTEL','ECOMMERCE')),
  title         text        not null,
  image_url     text        not null default '',
  target_url    text        not null,
  target_price  numeric     not null,
  current_price numeric     not null,
  currency      text        not null default 'PHP',
  is_favorite   boolean     not null default false,
  created_at    timestamptz not null default now()
);

alter table public.tracked_items enable row level security;

create policy "Users manage own tracked items"
  on public.tracked_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLE: alerts
-- One row per deal alert / system notification sent to a user.
-- ============================================================
create table if not exists public.alerts (
  id        uuid        primary key default uuid_generate_v4(),
  user_id   uuid        not null references public.profiles(id) on delete cascade,
  item_id   uuid        references public.tracked_items(id) on delete set null,
  type      text        not null check (type in ('DEAL_ALERT','SYSTEM_OUT_OF_TOKENS')),
  subject   text        not null,
  html_body text        not null,
  read      boolean     not null default false,
  sent_at   timestamptz not null default now()
);

alter table public.alerts enable row level security;

create policy "Users manage own alerts"
  on public.alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- Fires when a new row appears in auth.users
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, tier, email_tokens, selected_categories)
  values (
    new.id,
    new.email,
    'FREE',
    5,
    '{}'
  )
  on conflict (id) do nothing;  -- safe if the app already upserted
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
