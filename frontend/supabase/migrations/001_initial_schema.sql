-- ============================================================
-- FinSense — Supabase Schema (PostgreSQL)
-- Run this in the Supabase SQL Editor to set up all tables
-- ============================================================

-- 1. Users (managed via Supabase Auth, this is a profile mirror)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null,
  avatar_initials text not null default ''
);
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- 2. Connected accounts
create table if not exists public.connected_accounts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  institution text not null,
  nickname    text not null,
  mask        text not null,
  balance     numeric(12,2) not null default 0,
  sync_status text not null default 'synced' check (sync_status in ('synced','syncing','error')),
  created_at  timestamptz not null default now()
);
alter table public.connected_accounts enable row level security;

create policy "Users manage own accounts"
  on public.connected_accounts for all using (auth.uid() = user_id);

-- 3. Transactions
create table if not exists public.transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  date           date not null,
  time           text,
  amount         numeric(12,2) not null,
  category       text not null,
  merchant       text not null,
  account        text not null,
  payment_method text not null check (payment_method in ('upi','cash')),
  notes          text,
  flagged        boolean not null default false,
  created_at     timestamptz not null default now()
);
alter table public.transactions enable row level security;

create policy "Users manage own transactions"
  on public.transactions for all using (auth.uid() = user_id);

-- 4. Budgets
create table if not exists public.budgets (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  category  text not null,
  "limit"   numeric(12,2) not null,
  spent     numeric(12,2) not null default 0,
  period    text not null default 'monthly' check (period in ('monthly','weekly'))
);
alter table public.budgets enable row level security;

create policy "Users manage own budgets"
  on public.budgets for all using (auth.uid() = user_id);

-- 5. Goals
create table if not exists public.goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  name           text not null,
  target_amount  numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  target_date    date not null,
  linked_account text
);
alter table public.goals enable row level security;

create policy "Users manage own goals"
  on public.goals for all using (auth.uid() = user_id);

-- 6. Agent insights
create table if not exists public.agent_insights (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  type           text not null check (type in ('alert','suggestion','summary')),
  message        text not null,
  severity       text not null check (severity in ('low','medium','high')),
  related_entity text,
  created_at     timestamptz not null default now()
);
alter table public.agent_insights enable row level security;

create policy "Users manage own insights"
  on public.agent_insights for all using (auth.uid() = user_id);

-- 7. Agent actions
create table if not exists public.agent_actions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  timestamp   timestamptz not null default now(),
  status      text not null default 'proposed' check (status in ('proposed','executed','undone'))
);
alter table public.agent_actions enable row level security;

create policy "Users manage own actions"
  on public.agent_actions for all using (auth.uid() = user_id);

-- 8. Assets / Investments
create table if not exists public.assets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  type       text not null check (type in ('stock','bond','cash','crypto')),
  value      numeric(12,2) not null,
  return_pct numeric(6,2) not null default 0,
  history    numeric[] not null default '{}'
);
alter table public.assets enable row level security;

create policy "Users manage own assets"
  on public.assets for all using (auth.uid() = user_id);

-- 9. Notifications
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in ('overspend','bill_due','unusual_transaction','goal_milestone','weekly_digest')),
  title      text not null,
  message    text not null,
  created_at timestamptz not null default now(),
  read       boolean not null default false
);
alter table public.notifications enable row level security;

create policy "Users manage own notifications"
  on public.notifications for all using (auth.uid() = user_id);

-- 10. Chat messages
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null check (role in ('user','agent')),
  text       text not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;

create policy "Users manage own chat messages"
  on public.chat_messages for all using (auth.uid() = user_id);

-- 11. Agent preferences
create table if not exists public.agent_preferences (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid unique not null references public.profiles(id) on delete cascade,
  autonomy_level          int not null default 3 check (autonomy_level between 1 and 5),
  notify_overspend        boolean not null default true,
  notify_bill_due         boolean not null default true,
  notify_unusual_transaction boolean not null default true,
  notify_goal_milestone   boolean not null default true,
  notify_weekly_digest    boolean not null default false
);
alter table public.agent_preferences enable row level security;

create policy "Users manage own preferences"
  on public.agent_preferences for all using (auth.uid() = user_id);

-- Helper: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, email, avatar_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    upper(left(coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), 2))
  );
  insert into public.agent_preferences (user_id) values (new.id);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
