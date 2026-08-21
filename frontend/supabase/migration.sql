-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (created on signup via trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  avatar_initials text not null default ''
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    upper(substr(coalesce(new.raw_user_meta_data ->> 'name', new.email), 1, 2))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  time time,
  amount numeric(12,2) not null,
  category text not null,
  merchant text not null,
  account text not null,
  payment_method text not null default 'cash',
  notes text,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_transactions_user on public.transactions(user_id);

-- 3. BUDGETS
create table if not exists public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  "limit" numeric(12,2) not null,
  spent numeric(12,2) not null default 0,
  period text not null default 'monthly'
);
create index if not exists idx_budgets_user on public.budgets(user_id);

-- 4. GOALS
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  target_date date not null,
  linked_account text
);
create index if not exists idx_goals_user on public.goals(user_id);

-- 5. AGENT INSIGHTS
create table if not exists public.agent_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  message text not null,
  severity text not null default 'medium',
  created_at timestamptz not null default now(),
  related_entity text
);
create index if not exists idx_agent_insights_user on public.agent_insights(user_id);

-- 6. AGENT ACTIONS
create table if not exists public.agent_actions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  timestamp timestamptz not null default now(),
  status text not null default 'proposed'
);
create index if not exists idx_agent_actions_user on public.agent_actions(user_id);

-- 7. ASSETS
create table if not exists public.assets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  value numeric(14,2) not null,
  return_pct numeric(6,2) not null default 0,
  history jsonb not null default '[]'
);
create index if not exists idx_assets_user on public.assets(user_id);

-- 8. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- 9. CONNECTED ACCOUNTS
create table if not exists public.connected_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution text not null,
  nickname text not null,
  mask text not null,
  balance numeric(14,2) not null default 0,
  sync_status text not null default 'synced'
);
create index if not exists idx_connected_accounts_user on public.connected_accounts(user_id);

-- 10. CHAT MESSAGES
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_chat_messages_user on public.chat_messages(user_id);

-- 11. AGENT PREFERENCES
create table if not exists public.agent_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  autonomy_level int not null default 3,
  notify_overspend boolean not null default true,
  notify_bill_due boolean not null default true,
  notify_unusual_transaction boolean not null default true,
  notify_goal_milestone boolean not null default true,
  notify_weekly_digest boolean not null default false
);

-- Auto-create agent_preferences on signup
create or replace function public.handle_new_user_preferences()
returns trigger as $$
begin
  insert into public.agent_preferences (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_prefs on auth.users;
create trigger on_auth_user_created_prefs
  after insert on auth.users
  for each row execute function public.handle_new_user_preferences();

-- 12. UPI ACCOUNTS
create table if not exists public.upi_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  upi_id text not null,
  provider text not null,
  account_holder text not null default '',
  bank_name text not null default '',
  is_primary boolean not null default false,
  linked_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now()
);
create index if not exists idx_upi_accounts_user on public.upi_accounts(user_id);
