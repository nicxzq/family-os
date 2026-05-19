-- Family OS – Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ── Tables ────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id      uuid primary key references auth.users(id) on delete cascade,
  name    text        not null,
  avatar  text        not null default 'chick',
  color   text        not null default 'coral',
  role    text        not null default 'child'
                      check (role in ('parent', 'child', 'friend')),
  created_at timestamptz default now()
);

create table if not exists public.invite_codes (
  code        text primary key,
  created_by  uuid references public.profiles(id) on delete set null,
  label       text,
  max_uses    int  not null default 1,
  uses        int  not null default 0,
  expires_at  timestamptz,
  created_at  timestamptz default now()
);

create table if not exists public.diary_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  mood       text check (mood in ('happy','calm','curious','tired','sad')),
  created_at timestamptz default now()
);

create table if not exists public.activity_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null check (activity_type in ('storybook','game')),
  activity_id   text not null,
  title         text not null,
  created_at    timestamptz default now()
);

create table if not exists public.reading_progress (
  user_id     uuid  not null references public.profiles(id) on delete cascade,
  book_id     text  not null,
  pages_read  int[] not null default '{}',
  last_page   int   not null default 0,
  completed   boolean not null default false,
  last_read_at timestamptz default now(),
  primary key (user_id, book_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.invite_codes      enable row level security;
alter table public.diary_entries     enable row level security;
alter table public.activity_history  enable row level security;
alter table public.reading_progress  enable row level security;

-- profiles: anyone can read, each user manages their own row
create policy "profiles_select"        on public.profiles for select using (true);
create policy "profiles_insert_own"    on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"    on public.profiles for update using (auth.uid() = id);

-- invite_codes: anyone can read; parents can insert/update
create policy "codes_select"           on public.invite_codes for select using (true);
create policy "codes_insert_parent"    on public.invite_codes for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'parent'));
create policy "codes_update_parent"    on public.invite_codes for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'parent'));

-- diary, activity, progress: users own their own data
create policy "diary_own"     on public.diary_entries    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activity_own"  on public.activity_history using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_own"  on public.reading_progress using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Trigger: auto-create profile on signup ────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar, color, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name',   '新成员'),
    coalesce(new.raw_user_meta_data->>'avatar', 'chick'),
    coalesce(new.raw_user_meta_data->>'color',  'coral'),
    coalesce(new.raw_user_meta_data->>'role',   'child')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Functions: invite-code validation ─────────────────────────────────────────

-- Check availability (read-only, safe to call before signup)
create or replace function public.check_invite_code(p_code text)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.invite_codes
    where code = p_code
      and uses < max_uses
      and (expires_at is null or expires_at > now())
  );
$$;

-- Consume one use (call after successful signup)
create or replace function public.use_invite_code(p_code text)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.invite_codes
     set uses = uses + 1
   where code = p_code
     and uses < max_uses
     and (expires_at is null or expires_at > now());
  return found;
end;
$$;

-- ── Seed invite codes ─────────────────────────────────────────────────────────

insert into public.invite_codes (code, label, max_uses) values
  ('FAMILY2026', '家庭专属码',    100),
  ('FRIEND01',   '朋友邀请码 1',   5),
  ('FRIEND02',   '朋友邀请码 2',   5),
  ('FRIEND03',   '朋友邀请码 3',   5)
on conflict (code) do nothing;
