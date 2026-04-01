-- Real-time locations tracking table
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  user_id text not null,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.locations enable row level security;

-- Policy: Users can insert their own locations
create policy "Users can insert own locations"
  on locations for insert
  with check ( auth.uid()::text = user_id );

-- Policy: Task creator can view executor locations
create policy "Task creators can view locations"
  on locations for select
  using (
    exists (
      select 1 from tasks
      where tasks.id = locations.task_id
      and tasks.user_id = auth.uid()::text
      and tasks.status = 'in_progress'
    )
  );

-- Index for real-time queries
create index locations_task_idx on locations (task_id, timestamp desc);

-- Auto-cleanup: delete old locations after 24 hours
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
