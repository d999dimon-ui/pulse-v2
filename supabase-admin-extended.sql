-- Extended Admin Schema with Stats & User Management
-- Run in Supabase SQL Editor

-- ============================================
-- EXTENDED ADMIN STATS
-- ============================================
alter table public.admin_stats 
add column if not exists gmv_total numeric default 0,
add column if not exists active_executors integer default 0,
add column if not exists ai_blocked_tasks integer default 0;

-- ============================================
-- DAILY STATS TABLE (for charts)
-- ============================================
create table if not exists public.daily_stats (
  id uuid default gen_random_uuid() primary key,
  date date default current_date,
  gmv numeric default 0,
  commissions numeric default 0,
  tasks_created integer default 0,
  tasks_completed integer default 0,
  users_registered integer default 0,
  ai_blocked integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date)
);

-- ============================================
-- USER PROFILES TABLE
-- ============================================
create table if not exists public.user_profiles (
  user_id text primary key,
  username text,
  balance numeric default 0,
  rating numeric default 5,
  completed_tasks integer default 0,
  created_tasks integer default 0,
  is_banned boolean default false,
  banned_at timestamp with time zone,
  ban_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ESCROW DISPUTES TABLE
-- ============================================
create table if not exists public.escrow_disputes (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id),
  opened_by text, -- creator or executor
  reason text,
  status text default 'open', -- open, resolved, refunded, released
  resolution text,
  admin_id uuid references admin_config(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- ============================================
-- INDEXES
-- ============================================
create index daily_stats_date_idx on daily_stats (date desc);
create index user_profiles_banned_idx on user_profiles (is_banned) where is_banned = true;
create index escrow_disputes_status_idx on escrow_disputes (status);
create index escrow_disputes_task_idx on escrow_disputes (task_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to ban user
create or replace function ban_user(p_user_id text, p_reason text)
returns void as $$
begin
  -- Update user profile
  update user_profiles
  set is_banned = true,
      banned_at = now(),
      ban_reason = p_reason,
      updated_at = now()
  where user_id = p_user_id;
  
  -- Cancel all active tasks
  update tasks
  set status = 'cancelled',
      is_hidden = true,
      visibility = false
  where user_id = p_user_id and status = 'open';
  
  -- Log action
  insert into admin_audit_log (admin_id, action, details)
  values (
    current_setting('app.admin_id', true)::uuid,
    'ban_user',
    jsonb_build_object('user_id', p_user_id, 'reason', p_reason)
  );
end;
$$ language plpgsql security definer;

-- Function to unban user
create or replace function unban_user(p_user_id text)
returns void as $$
begin
  update user_profiles
  set is_banned = false,
      banned_at = null,
      ban_reason = null,
      updated_at = now()
  where user_id = p_user_id;
  
  -- Log action
  insert into admin_audit_log (admin_id, action, details)
  values (
    current_setting('app.admin_id', true)::uuid,
    'unban_user',
    jsonb_build_object('user_id', p_user_id)
  );
end;
$$ language plpgsql security definer;

-- Function to emergency release escrow
create or replace function emergency_release_escrow(
  p_task_id uuid,
  p_release_to text, -- 'executor' or 'creator'
  p_reason text
)
returns void as $$
declare
  v_task record;
  v_amount numeric;
  v_admin_fee numeric;
begin
  -- Get task details
  select * into v_task from tasks where id = p_task_id;
  
  if not found then
    raise exception 'Task not found';
  end if;
  
  v_amount := v_task.reward;
  v_admin_fee := v_amount * 0.1;
  
  -- Update task
  update tasks
  set status = 'completed',
      is_hidden = false
  where id = p_task_id;
  
  -- Create dispute record
  insert into escrow_disputes (task_id, opened_by, reason, status, resolution, admin_id)
  values (
    p_task_id,
    current_setting('app.admin_user_id', true),
    p_reason,
    'resolved',
    case 
      when p_release_to = 'executor' then 'Released to executor (90%)'
      when p_release_to = 'creator' then 'Refunded to creator (100%)'
    end,
    current_setting('app.admin_id', true)::uuid
  );
  
  -- Log action
  insert into admin_audit_log (admin_id, action, details)
  values (
    current_setting('app.admin_id', true)::uuid,
    'emergency_release',
    jsonb_build_object(
      'task_id', p_task_id,
      'release_to', p_release_to,
      'reason', p_reason,
      'amount', v_amount
    )
  );
end;
$$ language plpgsql security definer;

-- Function to update daily stats
create or replace function update_daily_stats()
returns trigger as $$
begin
  -- Insert or update today's stats
  insert into daily_stats (date, gmv, commissions, tasks_created, ai_blocked)
  values (
    current_date,
    case when TG_OP = 'INSERT' and new.status = 'open' then new.reward else 0 end,
    case when TG_OP = 'INSERT' and new.status = 'open' then new.reward * 0.1 else 0 end,
    case when TG_OP = 'INSERT' then 1 else 0 end,
    case when TG_OP = 'INSERT' and new.is_hidden then 1 else 0 end
  )
  on conflict (date) do update set
    gmv = daily_stats.gmv + case when new.status = 'open' then new.reward else 0 end,
    commissions = daily_stats.commissions + case when new.status = 'open' then new.reward * 0.1 else 0 end,
    tasks_created = daily_stats.tasks_created + case when TG_OP = 'INSERT' then 1 else 0 end,
    ai_blocked = daily_stats.ai_blocked + case when new.is_hidden then 1 else 0 end;
  
  return new;
end;
$$ language plpgsql;

-- Trigger for daily stats
create trigger daily_stats_tasks_trigger
  after insert on tasks
  for each row
  execute function update_daily_stats();

-- ============================================
-- INITIAL DATA
-- ============================================
-- Insert default user profiles from existing users
insert into user_profiles (user_id, username, balance, rating, completed_tasks, created_tasks)
select 
  user_id,
  username,
  sum(case when status = 'completed' and executor_id = user_id then reward else 0 end),
  5.0,
  count(case when status = 'completed' and executor_id = user_id then 1 end),
  count(case when user_id = user_id then 1 end)
from tasks
group by user_id
on conflict (user_id) do nothing;
