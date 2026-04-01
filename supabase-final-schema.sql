-- Pulse Final Schema - Complete Database Structure
-- Run in Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ============================================
-- TASKS TABLE
-- ============================================
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  reward numeric default 5,
  currency text default 'stars', -- stars, usd, ton
  category text default 'help', -- delivery, cleaning, help, photo
  latitude double precision not null,
  longitude double precision not null,
  status text default 'open', -- open, in_progress, completed, cancelled
  user_id text,
  executor_id text,
  reports_count integer default 0,
  is_hidden boolean default false,
  escrow_task_id text, -- Web3 escrow task ID
  visibility boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- LOCATIONS TABLE (Real-time tracking)
-- ============================================
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  user_id text not null,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- SUPPORT CHATS TABLE (AI + Admin)
-- ============================================
create table public.support_chats (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  messages jsonb[] default array[]::jsonb[],
  needs_admin_help boolean default false,
  is_resolved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ADMIN STATS TABLE
-- ============================================
create table public.admin_stats (
  id uuid default gen_random_uuid() primary key,
  total_commissions numeric default 0,
  active_tasks_count integer default 0,
  total_tasks_count integer default 0,
  total_users_count integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES
-- ============================================
create index tasks_location_idx on tasks using gist (
  ll_to_earth(latitude, longitude)
);
create index tasks_status_idx on tasks (status);
create index tasks_reports_idx on tasks (reports_count);
create index tasks_visibility_idx on tasks (visibility);
create index locations_task_idx on locations (task_id, timestamp desc);
create index support_chats_needs_help_idx on support_chats (needs_admin_help) where needs_admin_help = true;

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.tasks enable row level security;
alter table public.locations enable row level security;
alter table public.support_chats enable row level security;

-- Tasks: Public can view visible tasks
create policy "Public tasks are viewable"
  on tasks for select
  using ( visibility = true and is_hidden = false );

-- Tasks: Users can insert their own tasks
create policy "Users can insert own tasks"
  on tasks for insert
  with check ( auth.uid()::text = user_id );

-- Locations: Executor can insert own locations
create policy "Executor can insert locations"
  on locations for insert
  with check ( auth.uid()::text = user_id );

-- Locations: Task creator can view executor locations
create policy "Creator can view executor locations"
  on locations for select
  using (
    exists (
      select 1 from tasks
      where tasks.id = locations.task_id
      and tasks.user_id = auth.uid()::text
      and tasks.status = 'in_progress'
    )
  );

-- Support: Users can view own chats
create policy "Users can view own chats"
  on support_chats for select
  using ( auth.uid()::text = user_id );

-- Support: Users can insert own chats
create policy "Users can insert own chats"
  on support_chats for insert
  with check ( auth.uid()::text = user_id );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-hide tasks with 3+ reports
create or replace function check_reports_and_hide()
returns trigger as $$
begin
  if new.reports_count >= 3 then
    new.is_hidden := true;
    new.visibility := false;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger auto_hide_reported_tasks
  before update on tasks
  for each row
  execute function check_reports_and_hide();

-- Auto-cleanup old locations (24 hours)
create or replace function cleanup_old_locations()
returns trigger as $$
begin
  delete from locations
  where timestamp < now() - interval '24 hours';
  return new;
end;
$$ language plpgsql;

create trigger locations_cleanup_trigger
  after insert on locations
  execute function cleanup_old_locations();

-- Update support chat timestamp
create or replace function update_support_chat_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger support_chat_updated_at
  before update on support_chats
  for each row
  execute function update_support_chat_timestamp();

-- ============================================
-- INITIAL ADMIN STATS
-- ============================================
insert into public.admin_stats (id, total_commissions, active_tasks_count, total_tasks_count, total_users_count)
values (gen_random_uuid(), 0, 0, 0, 0);
