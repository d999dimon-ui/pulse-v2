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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.tasks enable row level security;

-- Create policies for public access (for demo)
create policy "Public tasks are viewable by everyone"
  on tasks for select
  using ( true );

create policy "Users can insert their own tasks"
  on tasks for insert
  with check ( true );

create policy "Users can update their own tasks"
  on tasks for update
  using ( true );

-- Create index for location-based queries
create index tasks_location_idx on tasks using gist (
  ll_to_earth(latitude, longitude)
);
