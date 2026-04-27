-- ============================================================
-- Red Collar — Migration
-- Run this in: Supabase Dashboard > SQL Editor > New query
--
-- Safe to run on a fresh project OR on top of an existing one
-- that already has profiles/messages tables.
-- ============================================================

-- ------------------------------------------------------------
-- Trigger function: keep updated_at current
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

-- Add any columns that may be missing on an existing table
alter table public.profiles add column if not exists job_title      text;
alter table public.profiles add column if not exists years_on_tools smallint not null default 0;
alter table public.profiles add column if not exists rig            text not null default 'Just the work van';
alter table public.profiles add column if not exists weekend_move   text not null default 'Down at the local';
alter table public.profiles add column if not exists brew_of_choice text not null default 'Whatever''s cold';
alter table public.profiles add column if not exists mode           text not null default 'dating';
alter table public.profiles add column if not exists show_me        text not null default 'everyone';
alter table public.profiles add column if not exists updated_at     timestamptz not null default now();

-- Trigger
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "profiles: authenticated users can read own row"   on public.profiles;
drop policy if exists "profiles: authenticated users can insert own row" on public.profiles;
drop policy if exists "profiles: authenticated users can update own row" on public.profiles;
drop policy if exists "profiles: authenticated users can delete own row" on public.profiles;

create policy "profiles: authenticated users can read own row"
  on public.profiles to authenticated for select
  using (auth.uid() is not null and auth.uid() = id);

create policy "profiles: authenticated users can insert own row"
  on public.profiles to authenticated for insert
  with check (auth.uid() is not null and auth.uid() = id);

create policy "profiles: authenticated users can update own row"
  on public.profiles to authenticated for update
  using  (auth.uid() is not null and auth.uid() = id)
  with check (auth.uid() is not null and auth.uid() = id);

create policy "profiles: authenticated users can delete own row"
  on public.profiles to authenticated for delete
  using (auth.uid() is not null and auth.uid() = id);

-- ------------------------------------------------------------
-- decisions
-- ------------------------------------------------------------
create table if not exists public.decisions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  decision   text not null check (decision in ('like','pass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, profile_id)
);

drop trigger if exists decisions_set_updated_at on public.decisions;
create trigger decisions_set_updated_at
  before update on public.decisions
  for each row execute function public.set_updated_at();

alter table public.decisions enable row level security;

drop policy if exists "decisions: authenticated users manage own rows" on public.decisions;
create policy "decisions: authenticated users manage own rows"
  on public.decisions to authenticated for all
  using  (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- ------------------------------------------------------------
-- matches
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

drop policy if exists "matches: authenticated users manage own rows" on public.matches;
create policy "matches: authenticated users manage own rows"
  on public.matches to authenticated for all
  using  (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- ------------------------------------------------------------
-- messages
-- messages.match_id is a FK to matches(id) — bigint.
-- If messages already exists with match_id as text, drop and recreate.
-- (Safe because the table was empty on this project.)
-- ------------------------------------------------------------
do $$
begin
  -- Check if match_id column is text type (old schema)
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'messages'
      and column_name  = 'match_id'
      and data_type    = 'text'
  ) then
    drop table if exists public.messages cascade;
  end if;
end $$;

create table if not exists public.messages (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  match_id   bigint not null references public.matches(id) on delete cascade,
  text       text not null,
  from_me    boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "messages: authenticated users manage own rows" on public.messages;
create policy "messages: authenticated users manage own rows"
  on public.messages to authenticated for all
  using  (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index if not exists decisions_user_id_idx    on public.decisions(user_id);
create index if not exists decisions_profile_id_idx on public.decisions(profile_id);

create index if not exists matches_user_id_idx    on public.matches(user_id);
create index if not exists matches_profile_id_idx on public.matches(profile_id);

create index if not exists messages_user_id_match_id_idx on public.messages(user_id, match_id);
create index if not exists messages_match_id_idx         on public.messages(match_id);
create index if not exists messages_created_at_idx       on public.messages(created_at);
