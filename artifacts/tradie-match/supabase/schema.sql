-- ============================================================
-- Red Collar — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- Enable UUID extension (already enabled on Supabase by default)
-- create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- updated_at trigger
-- Reusable function to keep updated_at current on any table.
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- profiles
-- One row per authenticated user; mirrors UserProfile in app.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  name           text not null,
  age            smallint not null check (age >= 18),
  gender         text not null check (gender in ('male','female')),
  trade          text not null,
  job_title      text,
  years_on_tools smallint not null default 0,
  suburb         text not null,
  bio            text not null,
  rig            text not null default 'Just the work van',
  weekend_move   text not null default 'Down at the local',
  brew_of_choice text not null default 'Whatever''s cold',
  mode           text not null default 'dating' check (mode in ('dating','mates')),
  show_me        text not null default 'everyone' check (show_me in ('men','women','everyone')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Keep updated_at in sync automatically
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: authenticated users can read own row"
  on public.profiles
  to authenticated
  for select
  using (auth.uid() is not null and auth.uid() = id);

create policy "profiles: authenticated users can insert own row"
  on public.profiles
  to authenticated
  for insert
  with check (auth.uid() is not null and auth.uid() = id);

create policy "profiles: authenticated users can update own row"
  on public.profiles
  to authenticated
  for update
  using (auth.uid() is not null and auth.uid() = id)
  with check (auth.uid() is not null and auth.uid() = id);

create policy "profiles: authenticated users can delete own row"
  on public.profiles
  to authenticated
  for delete
  using (auth.uid() is not null and auth.uid() = id);

-- ------------------------------------------------------------
-- decisions
-- Records each swipe (like/pass) per (user, profile) pair.
-- One final decision per user+profile: to change it, UPDATE
-- the existing row (the upsert in the app handles this).
-- The unique constraint enforces "final decision" semantics.
-- ------------------------------------------------------------
create table if not exists public.decisions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  decision   text not null check (decision in ('like','pass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One decision per (user, profile); UPDATE to change it.
  unique (user_id, profile_id)
);

create trigger decisions_set_updated_at
  before update on public.decisions
  for each row execute function public.set_updated_at();

alter table public.decisions enable row level security;

create policy "decisions: authenticated users manage own rows"
  on public.decisions
  to authenticated
  for all
  using  (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- ------------------------------------------------------------
-- matches
-- Created when a like results in a match (70 % probability).
-- ------------------------------------------------------------
create table if not exists public.matches (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  profile_id   text not null,
  matched_at   timestamptz not null default now(),
  last_read_at timestamptz,
  mode         text not null default 'dating' check (mode in ('dating','mates')),
  unique (user_id, profile_id)
);

alter table public.matches enable row level security;

create policy "matches: authenticated users manage own rows"
  on public.matches
  to authenticated
  for all
  using  (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- ------------------------------------------------------------
-- messages
-- Chat messages tied to a specific match row.
-- match_id is a FK to matches(id) — bigint, not text.
-- id is a client-generated text key (base36 timestamp + random)
-- to allow optimistic inserts without a round-trip for the PK.
-- ------------------------------------------------------------
create table if not exists public.messages (
  id         text primary key,          -- client-generated: Date.now().toString(36) + random
  user_id    uuid not null references auth.users(id) on delete cascade,
  match_id   bigint not null references public.matches(id) on delete cascade,
  text       text not null,
  from_me    boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages: authenticated users manage own rows"
  on public.messages
  to authenticated
  for all
  using  (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- ------------------------------------------------------------
-- Indexes
-- user_id indexes support RLS scans.
-- profile_id index on matches speeds up "find match by profile".
-- match_id index on messages speeds up conversation fetches.
-- ------------------------------------------------------------
create index if not exists decisions_user_id_idx    on public.decisions(user_id);
create index if not exists decisions_profile_id_idx on public.decisions(profile_id);

create index if not exists matches_user_id_idx    on public.matches(user_id);
create index if not exists matches_profile_id_idx on public.matches(profile_id);

-- Composite (user_id, match_id) covers the "my messages in this chat" query.
create index if not exists messages_user_id_match_id_idx on public.messages(user_id, match_id);
create index if not exists messages_match_id_idx         on public.messages(match_id);
create index if not exists messages_created_at_idx       on public.messages(created_at);
