-- Gamification & Motivation System Schema
-- Run in Supabase SQL Editor

-- ============================================
-- USER STATS TABLE (Sliding 7-day window)
-- ============================================
create table if not exists public.user_stats (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique,
  
  -- Task categories (auto-detected)
  task_category text default 'fast', -- 'fast' or 'deep'
  
  -- Sliding window stats (last 7 days)
  tasks_completed_7d integer default 0,
  tasks_completed_total integer default 0,
  
  -- Weekly goals
  weekly_goal integer default 0,
  weekly_progress integer default 0,
  week_start_date date default current_date,
  week_end_date date default (current_date + interval '7 days'),
  
  -- XP and leveling
  xp_points numeric default 0,
  level integer default 1,
  streak_days integer default 0,
  last_task_date date,
  
  -- Ratings
  rating numeric default 5.0,
  total_ratings integer default 0,
  
  -- Auto-detected profile
  avg_task_duration_minutes numeric default 30,
  preferred_categories jsonb default '[]'::jsonb,
  
  -- Fraud detection
  fraud_score integer default 0,
  flagged_for_review boolean default false,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_ai_check timestamp with time zone
);

-- ============================================
-- WEEKLY CHALLENGES TABLE
-- ============================================
create table if not exists public.weekly_challenges (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  challenge_type text not null, -- standard, lucky, ai_negotiated, admin_assigned
  goal_tasks integer not null,
  reward_hours numeric not null,
  progress integer default 0,
  status text default 'active', -- active, completed, failed, expired
  start_date date not null,
  end_date date not null,
  accepted_at timestamp with time zone,
  completed_at timestamp with time zone,
  assigned_by text, -- 'ai', 'admin', or 'system'
  admin_id text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- GAMIFICATION LOG (Audit Trail)
-- ============================================
create table if not exists public.gamification_log (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  action text not null, -- goal_assigned, goal_completed, lucky_chance, ai_negotiation, admin_override
  details jsonb,
  xp_awarded numeric default 0,
  bonus_hours_awarded numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- LUCKY CHANCE CONFIG
-- ============================================
create table if not exists public.lucky_chance_config (
  id uuid default gen_random_uuid() primary key,
  is_active boolean default false,
  discount_percent numeric default 30, -- 30% easier goal
  bonus_hours numeric default 6,
  selection_criteria text, -- 'random', 'top_performers', 'new_users'
  max_winners integer default 100,
  current_winners integer default 0,
  start_date date,
  end_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES
-- ============================================
create index user_stats_user_idx on user_stats (user_id);
create index user_stats_tasks_7d_idx on user_stats (tasks_completed_7d desc);
create index user_stats_level_idx on user_stats (level desc);
create index weekly_challenges_user_idx on weekly_challenges (user_id);
create index weekly_challenges_status_idx on weekly_challenges (status) where status = 'active';
create index weekly_challenges_end_date_idx on weekly_challenges (end_date);
create index gamification_log_user_idx on gamification_log (user_id);
create index gamification_log_created_idx on gamification_log (created_at desc);
create index lucky_chance_active_idx on lucky_chance_config (is_active) where is_active = true;

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.user_stats enable row level security;
alter table public.weekly_challenges enable row level security;
alter table public.gamification_log enable row level security;
alter table public.lucky_chance_config enable row level security;

-- User stats: Users can view own
create policy "Users can view own stats"
  on user_stats for select
  using ( auth.uid()::text = user_id );

-- Weekly challenges: Users can view own
create policy "Users can view own challenges"
  on weekly_challenges for select
  using ( auth.uid()::text = user_id );

-- Gamification log: Users can view own
create policy "Users can view own gamification log"
  on gamification_log for select
  using ( auth.uid()::text = user_id );

-- Lucky chance: Public can view active
create policy "Public can view active lucky chance"
  on lucky_chance_config for select
  using ( is_active = true );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-detect user category (fast vs deep tasks)
create or replace function detect_user_category(p_user_id text)
returns text as $$
declare
  v_avg_duration numeric;
begin
  -- Calculate average task duration from completed tasks
  select avg(
    extract(epoch from (completed_at - created_at)) / 60
  ) into v_avg_duration
  from tasks
  where executor_id = p_user_id
  and status = 'completed'
  and completed_at > now() - interval '30 days';
  
  -- Fast tasks: < 60 min average, Deep tasks: >= 60 min
  if v_avg_duration < 60 then
    return 'fast';
  else
    return 'deep';
  end if;
end;
$$ language plpgsql security definer;

-- Calculate weekly goal based on category and level
create or replace function calculate_weekly_goal(
  p_user_id text,
  p_category text,
  p_level integer
)
returns integer as $$
declare
  v_base_goal integer;
  v_multiplier numeric;
begin
  -- Base goals by category
  if p_category = 'fast' then
    v_base_goal := 60; -- 60-200 tasks/week
    v_multiplier := 1 + ((p_level - 1) * 0.1); -- +10% per level
  else
    v_base_goal := 10; -- 10-30 tasks/week
    v_multiplier := 1 + ((p_level - 1) * 0.05); -- +5% per level
  end if;
  
  return round(v_base_goal * v_multiplier);
end;
$$ language plpgsql security definer;

-- Calculate XP reward based on task
create or replace function calculate_xp_reward(
  p_task_reward numeric,
  p_rating numeric default 5.0
)
returns numeric as $$
begin
  -- Base XP = task reward
  -- Bonus for high rating
  return p_task_reward * (1 + ((p_rating - 3) * 0.2)); -- +20% per star above 3
end;
$$ language plpgsql security definer;

-- Level up calculation
create or replace function calculate_level(p_xp numeric)
returns integer as $$
begin
  -- Level formula: sqrt(XP / 100)
  return floor(sqrt(p_xp / 100)) + 1;
end;
$$ language plpgsql;

-- Update user stats after task completion
create or replace function update_user_stats_after_task()
returns trigger as $$
declare
  v_stats record;
  v_xp_reward numeric;
  v_new_level integer;
begin
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    -- Get or create user stats
    select * into v_stats from user_stats where user_id = new.executor_id;
    
    if not found then
      -- Initialize stats for new user
      insert into user_stats (user_id, task_category)
      values (new.executor_id, detect_user_category(new.executor_id))
      returning * into v_stats;
    end if;
    
    -- Calculate XP
    v_xp_reward := calculate_xp_reward(new.reward, 5.0);
    
    -- Update stats
    update user_stats
    set tasks_completed_7d = tasks_completed_7d + 1,
        tasks_completed_total = tasks_completed_total + 1,
        weekly_progress = weekly_progress + 1,
        xp_points = xp_points + v_xp_reward,
        level = calculate_level(xp_points + v_xp_reward),
        last_task_date = current_date,
        updated_at = now()
    where user_id = new.executor_id;
    
    -- Check if weekly goal completed
    update user_stats
    set weekly_goal = calculate_weekly_goal(user_id, task_category, level)
    where user_id = new.executor_id;
    
    -- Log gamification action
    insert into gamification_log (user_id, action, details, xp_awarded)
    values (
      new.executor_id,
      'task_completed',
      jsonb_build_object('task_id', new.id, 'reward', new.reward),
      v_xp_reward
    );
    
    -- Check for weekly milestone
    perform check_weekly_milestone(new.executor_id);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Check weekly milestone and award bonus
create or replace function check_weekly_milestone(p_user_id text)
returns void as $$
declare
  v_stats record;
  v_challenge record;
begin
  select * into v_stats from user_stats where user_id = p_user_id;
  
  if not found then return; end if;
  
  -- Check if weekly goal reached
  if v_stats.weekly_progress >= v_stats.weekly_goal and v_stats.weekly_goal > 0 then
    -- Find active challenge
    select * into v_challenge
    from weekly_challenges
    where user_id = p_user_id
    and status = 'active'
    and end_date >= current_date
    order by created_at desc
    limit 1;
    
    if found and v_challenge.progress >= v_challenge.goal_tasks then
      -- Award bonus
      perform activate_bonus(
        p_user_id,
        v_challenge.reward_hours,
        'weekly_milestone',
        'weekly_challenge_' || v_challenge.id::text,
        'Weekly challenge completed: ' || v_challenge.goal_tasks || ' tasks',
        v_challenge.assigned_by
      );
      
      -- Update challenge status
      update weekly_challenges
      set status = 'completed',
          completed_at = now()
      where id = v_challenge.id;
      
      -- Log
      insert into gamification_log (user_id, action, details, bonus_hours_awarded)
      values (
        p_user_id,
        'weekly_milestone_completed',
        jsonb_build_object('challenge_id', v_challenge.id, 'goal', v_challenge.goal_tasks),
        v_challenge.reward_hours
      );
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- Assign weekly challenge to user
create or replace function assign_weekly_challenge(
  p_user_id text,
  p_goal_tasks integer,
  p_reward_hours numeric,
  p_challenge_type text default 'standard',
  p_assigned_by text default 'system',
  p_admin_id text default null
)
returns uuid as $$
declare
  v_challenge_id uuid;
begin
  -- Deactivate existing active challenges
  update weekly_challenges
  set status = 'expired'
  where user_id = p_user_id
  and status = 'active';
  
  -- Create new challenge
  insert into weekly_challenges (
    user_id, challenge_type, goal_tasks, reward_hours,
    start_date, end_date, assigned_by, admin_id, status
  ) values (
    p_user_id, p_challenge_type, p_goal_tasks, p_reward_hours,
    current_date, current_date + interval '7 days',
    p_assigned_by, p_admin_id, 'active'
  ) returning id into v_challenge_id;
  
  -- Update user stats weekly goal
  update user_stats
  set weekly_goal = p_goal_tasks,
      weekly_progress = 0,
      week_start_date = current_date,
      week_end_date = current_date + interval '7 days'
  where user_id = p_user_id;
  
  -- Log
  insert into gamification_log (user_id, action, details)
  values (
    p_user_id,
    'goal_assigned',
    jsonb_build_object(
      'challenge_id', v_challenge_id,
      'goal', p_goal_tasks,
      'reward', p_reward_hours,
      'type', p_challenge_type
    )
  );
  
  return v_challenge_id;
end;
$$ language plpgsql security definer;

-- Lucky Chance: Random bonus assignment
create or replace function run_lucky_chance()
returns integer as $$
declare
  v_config record;
  v_winners integer := 0;
  v_user record;
  v_discounted_goal integer;
begin
  select * into v_config from lucky_chance_config where is_active = true;
  
  if not found then return 0; end if;
  
  -- Select random active users
  for v_user in
    select user_id, task_category, level
    from user_stats
    where tasks_completed_7d > 0
    order by random()
    limit v_config.max_winners
  loop
    -- Calculate discounted goal
    v_discounted_goal := round(
      calculate_weekly_goal(v_user.user_id, v_user.task_category, v_user.level)
      * (1 - v_config.discount_percent / 100)
    );
    
    -- Assign lucky challenge
    perform assign_weekly_challenge(
      v_user.user_id,
      v_discounted_goal,
      v_config.bonus_hours,
      'lucky_chance',
      'system',
      null
    );
    
    v_winners := v_winners + 1;
  end loop;
  
  -- Update config
  update lucky_chance_config
  set current_winners = v_winners,
      updated_at = now()
  where is_active = true;
  
  return v_winners;
end;
$$ language plpgsql security definer;

-- AI Negotiation: Create custom challenge
create or replace function ai_negotiate_challenge(
  p_user_id text,
  p_increase_percent numeric default 20
)
returns uuid as $$
declare
  v_stats record;
  v_new_goal integer;
  v_reward_hours numeric;
begin
  select * into v_stats from user_stats where user_id = p_user_id;
  
  if not found then return null; end if;
  
  -- Calculate increased goal
  v_new_goal := round(v_stats.weekly_goal * (1 + p_increase_percent / 100));
  v_reward_hours := v_stats.weekly_goal * 0.1; -- 1 hour per 10 tasks
  
  return assign_weekly_challenge(
    p_user_id,
    v_new_goal,
    v_reward_hours,
    'ai_negotiated',
    'ai',
    null
  );
end;
$$ language plpgsql security definer;

-- Admin override: Manual goal assignment
create or replace function admin_assign_challenge(
  p_user_id text,
  p_goal_tasks integer,
  p_reward_hours numeric,
  p_admin_id text,
  p_notes text default null
)
returns uuid as $$
begin
  return assign_weekly_challenge(
    p_user_id,
    p_goal_tasks,
    p_reward_hours,
    'admin_assigned',
    'admin',
    p_admin_id
  );
end;
$$ language plpgsql security definer;

-- Trigger for task completion
create trigger user_stats_after_task_trigger
  after insert or update on tasks
  for each row
  execute function update_user_stats_after_task();

-- Auto-reset weekly stats (cron job simulation)
create or replace function reset_weekly_stats()
returns void as $$
begin
  -- Reset weekly progress for all users
  update user_stats
  set weekly_progress = 0,
      week_start_date = week_end_date,
      week_end_date = week_end_date + interval '7 days',
      tasks_completed_7d = 0
  where week_end_date < current_date;
  
  -- Expire old challenges
  update weekly_challenges
  set status = 'expired'
  where status = 'active'
  and end_date < current_date;
  
  -- Deactivate old lucky chance
  update lucky_chance_config
  set is_active = false
  where is_active = true
  and end_date < current_date;
end;
$$ language plpgsql;

-- ============================================
-- INITIAL DATA
-- ============================================
insert into lucky_chance_config (is_active, discount_percent, bonus_hours, max_winners)
values (false, 30, 6, 100);
