-- TaskHub Tasks Table
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  reward numeric default 5,
  currency text default 'stars', -- stars, usd, ton
  category text default 'help', -- delivery, cleaning, help, photo
  latitude double precision not null,
  longitude double precision not null,
  status text default 'open', -- open, in_progress, completed
  user_id text,
  reports_count integer default 0,
  is_hidden boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.tasks enable row level security;

-- Create policies for public access (for demo)
create policy "Public tasks are viewable by everyone"
  on tasks for select
  using ( is_hidden = false );

create policy "Users can insert their own tasks"
  on tasks for insert
  with check ( true );

create policy "Users can update their own tasks"
  on tasks for update
  using ( true );

-- Function to auto-hide tasks with 3+ reports
create or replace function check_reports_and_hide()
returns trigger as $$
begin
  if new.reports_count >= 3 then
    new.is_hidden := true;
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-hide tasks
create trigger auto_hide_reported_tasks
  before update on tasks
  for each row
  execute function check_reports_and_hide();

-- Create index for location-based queries
create index tasks_location_idx on tasks using gist (
  ll_to_earth(latitude, longitude)
);

-- Index for reports
create index tasks_reports_idx on tasks (reports_count);
