-- ============================================================
-- Red Collar — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- Enable UUID extension (already enabled on Supabase by default)
-- create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- profiles
-- One row per authenticated user; mirrors UserProfile in app.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  age           smallint not null check (age >= 18),
  gender        text not null check (gender in ('male','female')),
  trade         text not null,
  job_title     text,
  years_on_tools smallint not null default 0,
  suburb        text not null,
  bio           text not null,
  rig           text not null default 'Just the work van',
  weekend_move  text not null default 'Down at the local',
  brew_of_choice text not null default 'Whatever''s cold',
  mode          text not null default 'dating' check (mode in ('dating','mates')),
  show_me       text not null default 'everyone' check (show_me in ('men','women','everyone')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Row-level security: users can only read/write their own row
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- ------------------------------------------------------------
-- decisions
-- Records each swipe: like or pass on a seed profile.
-- ------------------------------------------------------------
create table if not exists public.decisions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  decision   text not null check (decision in ('like','pass')),
  created_at timestamptz not null default now(),
  unique (user_id, profile_id)
);

alter table public.decisions enable row level security;

create policy "Users manage own decisions"
  on public.decisions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- matches
-- A match is created when a like results in a mutual connection.
-- ------------------------------------------------------------
create table if not exists public.matches (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  profile_id  text not null,
  matched_at  timestamptz not null default now(),
  last_read_at timestamptz,
  mode        text not null default 'dating' check (mode in ('dating','mates')),
  unique (user_id, profile_id)
);

alter table public.matches enable row level security;

create policy "Users manage own matches"
  on public.matches for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- messages
-- Chat messages between user and a matched seed profile.
-- ------------------------------------------------------------
create table if not exists public.messages (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  match_id   text not null,
  text       text not null,
  from_me    boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users manage own messages"
  on public.messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Indexes for performance
-- ------------------------------------------------------------
create index if not exists decisions_user_id_idx on public.decisions(user_id);
create index if not exists matches_user_id_idx on public.matches(user_id);
create index if not exists messages_user_id_match_id_idx on public.messages(user_id, match_id);
create index if not exists messages_created_at_idx on public.messages(created_at);
