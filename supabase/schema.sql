-- Family OS – Supabase schema
-- 全量幂等：可在新项目完整跑，也可在已有项目重复跑（不会破坏现有数据）
-- Run in: Supabase Dashboard → SQL Editor → New query → Run

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

-- WeChat bindings: openid → Supabase user_id（service role only）
create table if not exists public.wechat_bindings (
  openid     text primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- Contributions: 家庭成员对六条原则的贡献
create table if not exists public.contributions (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  type       text not null
               check (type in ('edit','objection','motto','drawing','note')),
  target_id  text,
  field      text,
  old_value  text,
  new_value  text not null,
  summary    text,
  privacy    text not null default 'family'
               check (privacy in ('public','family')),
  status     text not null default 'published'
               check (status in ('published','archived')),
  created_at timestamptz default now()
);

-- ── Column extensions（幂等）─────────────────────────────────────────────────

alter table public.profiles
  add column if not exists family_role text
    check (family_role in ('爸爸','妈妈','哥哥','弟弟','爷爷','奶奶','其他'));

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.invite_codes      enable row level security;
alter table public.diary_entries     enable row level security;
alter table public.activity_history  enable row level security;
alter table public.reading_progress  enable row level security;
alter table public.wechat_bindings   enable row level security;
alter table public.contributions     enable row level security;

-- profiles
drop policy if exists "profiles_select"     on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select"        on public.profiles for select using (true);
create policy "profiles_insert_own"    on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"    on public.profiles for update using (auth.uid() = id);

-- invite_codes
drop policy if exists "codes_select"        on public.invite_codes;
drop policy if exists "codes_insert_parent" on public.invite_codes;
drop policy if exists "codes_update_parent" on public.invite_codes;
create policy "codes_select"           on public.invite_codes for select using (true);
create policy "codes_insert_parent"    on public.invite_codes for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'parent'));
create policy "codes_update_parent"    on public.invite_codes for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'parent'));

-- diary / activity / progress
drop policy if exists "diary_own"     on public.diary_entries;
drop policy if exists "activity_own"  on public.activity_history;
drop policy if exists "progress_own"  on public.reading_progress;
create policy "diary_own"     on public.diary_entries    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activity_own"  on public.activity_history using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_own"  on public.reading_progress using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- wechat_bindings: 无面向客户端的 policy，service_role 直接操作

-- contributions
drop policy if exists "contributions_select"        on public.contributions;
drop policy if exists "contributions_insert_own"    on public.contributions;
drop policy if exists "contributions_update_own"    on public.contributions;
drop policy if exists "contributions_update_parent" on public.contributions;
create policy "contributions_select" on public.contributions
  for select using (
    privacy = 'public'
    or (privacy = 'family' and auth.role() = 'authenticated')
  );
create policy "contributions_insert_own" on public.contributions
  for insert with check (auth.uid() = author_id);
create policy "contributions_update_own" on public.contributions
  for update using (auth.uid() = author_id);
create policy "contributions_update_parent" on public.contributions
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'parent')
  );

-- ── Trigger: auto-create profile on signup ────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar, color, role, family_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name',        '新成员'),
    coalesce(new.raw_user_meta_data->>'avatar',      'chick'),
    coalesce(new.raw_user_meta_data->>'color',       'coral'),
    coalesce(new.raw_user_meta_data->>'role',        'child'),
    coalesce(new.raw_user_meta_data->>'family_role', null)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Functions: invite-code validation ─────────────────────────────────────────

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

-- ── E0-B: WeChat Open Platform bindings by unionid ───────────────────────────
-- 开放平台扫码登录返回 unionid（跨应用唯一），替代公众号 openid 作为绑定主键。

drop table if exists public.wechat_bindings cascade;

create table if not exists public.wechat_bindings (
  unionid     text primary key,
  openid      text,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz default now()
);

alter table public.wechat_bindings enable row level security;
-- 无面向客户端的 policy，service_role 直接操作

-- ── Summer plan check-in（暑假计划打卡，一人一行整份 JSONB 状态）──────────────
create table if not exists public.summer_plan (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.summer_plan enable row level security;

drop policy if exists "summer_plan_own" on public.summer_plan;
create policy "summer_plan_own" on public.summer_plan
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
