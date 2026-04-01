-- Trust, Profiles & Analytics System Schema
-- Run in Supabase SQL Editor

-- ============================================
-- EXTENDED USER PROFILES
-- ============================================
alter table public.user_profiles add column if not exists phone text unique;
alter table public.user_profiles add column if not exists phone_verified boolean default false;
alter table public.user_profiles add column if not exists telegram_username text;
alter table public.user_profiles add column if not exists telegram_id text;

-- Professional profile fields
alter table public.user_profiles add column if not exists bio text;
alter table public.user_profiles add column if not exists experience_years numeric;
alter table public.user_profiles add column if not exists joined_date date;
alter table public.user_profiles add column if not exists selected_categories jsonb default '[]'::jsonb;
alter table public.user_profiles add column if not exists portfolio_images jsonb default '[]'::jsonb;

-- Trust & rating
alter table public.user_profiles add column if not exists rating numeric default 5.0;
alter table public.user_profiles add column if not exists total_reviews integer default 0;
alter table public.user_profiles add column if not exists is_blocked boolean default false;
alter table public.user_profiles add column if not exists blocked_reason text;
alter table public.user_profiles add column if not exists blocked_at timestamp with time zone;

-- Badges
alter table public.user_profiles add column if not exists badges jsonb default '[]'::jsonb;

-- Location
alter table public.user_profiles add column if not exists city text;
alter table public.user_profiles add column if not exists country text default 'KG';

-- ============================================
-- REVIEWS TABLE
-- ============================================
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) unique,
  reviewer_id text not null, -- who wrote the review
  reviewed_id text not null, -- who received the review
  rating numeric not null check (rating >= 1 and rating <= 5),
  comment text,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(task_id, reviewer_id)
);

-- ============================================
-- USER ANALYTICS TABLE
-- ============================================
create table if not exists public.user_analytics (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique,
  
  -- Executor stats
  total_earned numeric default 0,
  total_earned_7d numeric default 0,
  total_earned_30d numeric default 0,
  tasks_completed integer default 0,
  tasks_completed_7d integer default 0,
  tasks_completed_30d integer default 0,
  avg_rating numeric default 5.0,
  commission_saved numeric default 0,
  
  -- Customer stats
  total_spent numeric default 0,
  total_spent_7d numeric default 0,
  total_spent_30d numeric default 0,
  tasks_created integer default 0,
  tasks_created_7d integer default 0,
  tasks_created_30d integer default 0,
  success_rate numeric default 100,
  
  -- Last update
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ADMIN ANALYTICS TABLE
-- ============================================
create table if not exists public.admin_analytics (
  id uuid default gen_random_uuid() primary key,
  metric_date date default current_date,
  
  -- Global metrics
  gmv_total numeric default 0,
  gmv_7d numeric default 0,
  gmv_30d numeric default 0,
  
  commissions_total numeric default 0,
  commissions_7d numeric default 0,
  commissions_30d numeric default 0,
  
  -- Users
  total_users integer default 0,
  new_registrations_7d integer default 0,
  new_registrations_30d integer default 0,
  active_users_7d integer default 0,
  active_users_30d integer default 0,
  
  -- Tasks
  total_tasks integer default 0,
  tasks_completed_7d integer default 0,
  tasks_completed_30d integer default 0,
  
  unique(metric_date)
);

-- ============================================
-- PORTFOLIO IMAGES TABLE
-- ============================================
create table if not exists public.portfolio_images (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  image_url text not null,
  task_id uuid references tasks(id),
  caption text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES
-- ============================================
create index user_profiles_phone_idx on user_profiles (phone);
create index user_profiles_rating_idx on user_profiles (rating desc);
create index user_profiles_city_idx on user_profiles (city);
create index user_profiles_badges_idx on user_profiles using gin (badges);
create index reviews_reviewed_idx on reviews (reviewed_id);
create index reviews_rating_idx on reviews (rating);
create index user_analytics_user_idx on user_analytics (user_id);
create index admin_analytics_date_idx on admin_analytics (metric_date desc);
create index portfolio_images_user_idx on portfolio_images (user_id);

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.reviews enable row level security;
alter table public.user_analytics enable row level security;
alter table public.admin_analytics enable row level security;
alter table public.portfolio_images enable row level security;

-- Reviews: Public can view, users can write own
create policy "Public can view reviews"
  on reviews for select
  using ( true );

create policy "Users can write reviews"
  on reviews for insert
  with check ( auth.uid()::text = reviewer_id );

-- User analytics: Users can view own
create policy "Users can view own analytics"
  on user_analytics for select
  using ( auth.uid()::text = user_id );

-- Admin analytics: Only admins can view (handled in app)
create policy "Admins can view analytics"
  on admin_analytics for select
  using ( false ); -- App-level check

-- Portfolio: Public can view
create policy "Public can view portfolio"
  on portfolio_images for select
  using ( true );

create policy "Users can upload portfolio"
  on portfolio_images for insert
  with check ( auth.uid()::text = user_id );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update rating after review
create or replace function update_user_rating()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update user_profiles
    set rating = (
      select avg(rating) from reviews where reviewed_id = new.reviewed_id
    ),
    total_reviews = (
      select count(*) from reviews where reviewed_id = new.reviewed_id
    )
    where user_id = new.reviewed_id;
  elsif TG_OP = 'UPDATE' then
    update user_profiles
    set rating = (
      select avg(rating) from reviews where reviewed_id = new.reviewed_id
    ),
    total_reviews = (
      select count(*) from reviews where reviewed_id = new.reviewed_id
    )
    where user_id = new.reviewed_id;
  end if;
  
  -- Auto-block if rating < 3.5
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    update user_profiles
    set is_blocked = true,
        blocked_reason = 'Rating below 3.5',
        blocked_at = now()
    where user_id = new.reviewed_id
    and rating < 3.5
    and is_blocked = false;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Update user analytics after task
create or replace function update_user_analytics_after_task()
returns trigger as $$
declare
  v_executor_analytics record;
  v_creator_analytics record;
begin
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    -- Executor analytics
    select * into v_executor_analytics from user_analytics where user_id = new.executor_id;
    
    if not found then
      insert into user_analytics (user_id, total_earned, tasks_completed)
      values (new.executor_id, new.reward, 1);
    else
      update user_analytics
      set total_earned = total_earned + new.reward,
          tasks_completed = tasks_completed + 1,
          last_updated = now()
      where user_id = new.executor_id;
    end if;
    
    -- Creator analytics
    select * into v_creator_analytics from user_analytics where user_id = new.user_id;
    
    if not found then
      insert into user_analytics (user_id, total_spent, tasks_created, success_rate)
      values (new.user_id, new.reward, 1, 100);
    else
      update user_analytics
      set total_spent = total_spent + new.reward,
          tasks_created = tasks_created + 1,
          last_updated = now()
      where user_id = new.user_id;
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Assign badges based on achievements
create or replace function assign_user_badges(p_user_id text)
returns jsonb as $$
declare
  v_profile record;
  v_badges jsonb := '[]'::jsonb;
begin
  select * into v_profile from user_profiles where user_id = p_user_id;
  
  if not found then return v_badges; end if;
  
  -- Newbie badge (< 5 tasks)
  if v_profile.total_reviews < 5 then
    v_badges := v_badges || '["newbie"]'::jsonb;
  end if;
  
  -- Pro badge (100+ tasks, rating 4.8+)
  if v_profile.total_reviews >= 100 and v_profile.rating >= 4.8 then
    v_badges := v_badges || '["pro"]'::jsonb;
  end if;
  
  -- Update profile
  update user_profiles
  set badges = v_badges
  where user_id = p_user_id;
  
  return v_badges;
end;
$$ language plpgsql security definer;

-- Get user trust score
create or replace function get_trust_score(p_user_id text)
returns numeric as $$
declare
  v_profile record;
  v_score numeric := 50; -- Base score
begin
  select * into v_profile from user_profiles where user_id = p_user_id;
  
  if not found then return 0; end if;
  
  -- Phone verified (+20)
  if v_profile.phone_verified then
    v_score := v_score + 20;
  end if;
  
  -- Rating bonus (up to +20)
  v_score := v_score + (v_profile.rating - 3) * 10;
  
  -- Experience bonus (up to +10)
  if v_profile.total_reviews >= 100 then
    v_score := v_score + 10;
  elsif v_profile.total_reviews >= 50 then
    v_score := v_score + 5;
  end if;
  
  -- Blocked penalty
  if v_profile.is_blocked then
    v_score := 0;
  end if;
  
  return least(100, greatest(0, v_score));
end;
$$ language plpgsql security definer;

-- Create review (with task verification)
create or replace function create_review(
  p_task_id uuid,
  p_rating numeric,
  p_comment text
)
returns uuid as $$
declare
  v_task record;
  v_review_id uuid;
begin
  -- Get task details
  select * into v_task from tasks where id = p_task_id;
  
  if not found then
    raise exception 'Task not found';
  end if;
  
  if v_task.status != 'completed' then
    raise exception 'Can only review completed tasks';
  end if;
  
  -- Only executor can review creator and vice versa
  if auth.uid()::text != v_task.executor_id and auth.uid()::text != v_task.user_id then
    raise exception 'Only task participants can review';
  end if;
  
  -- Insert review
  insert into reviews (task_id, reviewer_id, reviewed_id, rating, comment)
  values (
    p_task_id,
    auth.uid()::text,
    case when auth.uid()::text = v_task.executor_id then v_task.user_id else v_task.executor_id end,
    p_rating,
    p_comment
  ) returning id into v_review_id;
  
  -- Update badges
  perform assign_user_badges(
    case when auth.uid()::text = v_task.executor_id then v_task.user_id else v_task.executor_id end
  );
  
  return v_review_id;
end;
$$ language plpgsql security definer;

-- Triggers
create trigger reviews_after_insert_trigger
  after insert on reviews
  for each row
  execute function update_user_rating();

create trigger reviews_after_update_trigger
  after update on reviews
  for each row
  execute function update_user_rating();

create trigger user_analytics_after_task_trigger
  after insert or update on tasks
  for each row
  execute function update_user_analytics_after_task();

-- ============================================
-- INITIAL DATA
-- ============================================
-- Initialize analytics for existing users
insert into user_analytics (user_id)
select user_id from user_profiles
on conflict (user_id) do nothing;
