-- TaskHub Complete Schema
-- Multi-service marketplace with Web3 integration, ratings, and referral program

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ============================================
-- PROFILES TABLE (User Profiles + Reputation)
-- ============================================
create table if not exists public.profiles (
  id text primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  balance numeric default 0, -- главный баланс пользователя
  wallet_address text, -- Web3 кошелек
  rating numeric default 5, -- средняя оценка (0-5)
  total_reviews integer default 0,
  completed_tasks_as_executor integer default 0,
  completed_tasks_as_customer integer default 0,
  is_verified boolean default false,
  is_banned boolean default false,
  vip_status text default 'none', -- none, silver, gold, platinum
  vip_expires_at timestamp,
  language text default 'en',
  country text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- TASKS TABLE (Core tasks/orders)
-- ============================================
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null, -- it, couriers, household_services, marketing, delivery, cleaning, etc.
  reward numeric not null,
  currency text default 'ton', -- ton, usd, stars
  street_address text,
  latitude double precision not null,
  longitude double precision not null,
  
  -- Status: open -> claimed/in_progress -> completed/cancelled
  status text default 'open', -- open, claimed, in_progress, completed, cancelled, expired
  priority text default 'normal', -- normal, urgent, asap
  
  customer_id text not null references public.profiles(id) on delete cascade,
  executor_id text references public.profiles(id) on delete set null,
  
  -- Dates
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deadline timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  
  -- Moderation & Visibility
  is_hidden boolean default false,
  reports_count integer default 0,
  visibility boolean default true,
  
  -- Web3 fields
  escrow_contract_id text,
  payment_tx_hash text,
  
  -- Meteor field for filtering completions
  flash_xp_bonus numeric default 0
);

-- ============================================
-- TASK CANDIDATES (Executor bids/responses to tasks)
-- ============================================
create table if not exists public.task_candidates (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null references public.tasks(id) on delete cascade,
  executor_id text not null references public.profiles(id) on delete cascade,
  message text,
  proposed_price numeric, -- если отличается от исходной
  status text default 'pending', -- pending, accepted, rejected, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  responded_at timestamp with time zone
);

-- ============================================
-- REVIEWS & RATINGS TABLE
-- ============================================
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null references public.tasks(id) on delete cascade,
  reviewer_id text not null references public.profiles(id) on delete cascade,
  reviewee_id text not null references public.profiles(id) on delete cascade,
  rating numeric not null constraint valid_rating check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  review_type text not null, -- for_executor, for_customer
  
  -- Moderation
  is_verified boolean default true,
  is_hidden boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- LOCATIONS TRACKING (Real-time executor tracking)
-- ============================================
create table if not exists public.locations (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  heading numeric,
  speed numeric,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- PAYMENTS & TRANSACTIONS
-- ============================================
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null references public.tasks(id) on delete cascade,
  from_user_id text not null references public.profiles(id) on delete cascade,
  to_user_id text not null references public.profiles(id) on delete cascade,
  amount numeric not null,
  currency text not null,
  payment_method text not null, -- web3_wallet, credit_card, internal_balance
  status text default 'pending', -- pending, completed, failed, refunded
  
  -- Web3 fields
  tx_hash text,
  contract_address text,
  block_number integer,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- ============================================
-- REFERRAL PROGRAM
-- ============================================
create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id text not null references public.profiles(id) on delete cascade,
  referral_id text not null references public.profiles(id) on delete cascade unique,
  
  referral_code text unique,
  tasks_completed_by_referral integer default 0,
  bonus_status text default 'pending', -- pending, active, claimed, expired
  
  vip_promo_activated boolean default false,
  vip_promo_expires_at timestamp,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- PROMO CODES & BONUSES
-- ============================================
create table if not exists public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_percent numeric default 0,
  discount_amount numeric default 0,
  usage_limit integer,
  usage_count integer default 0,
  is_active boolean default true,
  
  created_by_admin text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone
);

-- ============================================
-- FAVORITES & SAVED TASKS
-- ============================================
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, task_id)
);

-- ============================================
-- CHAT MESSAGES (Task-related chat)
-- ============================================
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null references public.tasks(id) on delete cascade,
  sender_id text not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  attachments jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Tasks indexes
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_category_idx on public.tasks (category);
create index if not exists tasks_customer_idx on public.tasks (customer_id);
create index if not exists tasks_executor_idx on public.tasks (executor_id);
create index if not exists tasks_created_at_idx on public.tasks (created_at desc);
create index if not exists tasks_priority_idx on public.tasks (priority);

-- Geo index for nearby tasks
create index if not exists tasks_location_idx on public.tasks using gist (
  ll_to_earth(latitude, longitude)
);

-- Profiles indexes
create index if not exists profiles_rating_idx on public.profiles (rating desc);
create index if not exists profiles_vip_status_idx on public.profiles (vip_status);
create index if not exists profiles_verified_idx on public.profiles (is_verified);

-- Reviews indexes
create index if not exists reviews_reviewee_idx on public.reviews (reviewee_id);
create index if not exists reviews_reviewer_idx on public.reviews (reviewer_id);
create index if not exists reviews_task_idx on public.reviews (task_id);

-- Referral indexes
create index if not exists referrals_referrer_idx on public.referrals (referrer_id);
create index if not exists referrals_bonus_status_idx on public.referrals (bonus_status);

-- Locations indexes
create index if not exists locations_user_task_idx on public.locations (user_id, task_id);
create index if not exists locations_timestamp_idx on public.locations (timestamp desc);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_candidates enable row level security;
alter table public.reviews enable row level security;
alter table public.locations enable row level security;
alter table public.payments enable row level security;
alter table public.referrals enable row level security;
alter table public.chat_messages enable row level security;
alter table public.favorites enable row level security;

-- Public can view profiles
create policy "Public profiles are viewable"
  on profiles for select
  using ( is_banned = false );

-- Public can view visible tasks
create policy "Public can view visible tasks"
  on tasks for select
  using ( visibility = true and is_hidden = false );

-- Users can view their own tasks
create policy "Users can view own tasks"
  on tasks for select
  using ( customer_id = auth.uid()::text or executor_id = auth.uid()::text );

-- Candidates policy
create policy "Candidates are visible to customer and executor"
  on task_candidates for select
  using ( 
    executor_id = auth.uid()::text or 
    exists (select 1 from tasks t where t.id = task_id and t.customer_id = auth.uid()::text)
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update profile rating on new review
create or replace function update_profile_rating()
returns trigger as $$
declare
  new_rating numeric;
begin
  select avg(rating), count(*) into new_rating, new.total_reviews
  from reviews
  where reviewee_id = new.reviewee_id;
  
  update profiles
  set rating = coalesce(new_rating, 5),
      total_reviews = coalesce((select count(*) from reviews where reviewee_id = new.reviewee_id), 0)
  where id = new.reviewee_id;
  
  return new;
end;
$$ language plpgsql;

create trigger recalculate_rating_on_review
after insert on reviews
for each row
execute function update_profile_rating();

-- Auto-expire urgent/flash tasks
create or replace function expire_old_tasks()
returns void as $$
begin
  update tasks
  set status = 'expired'
  where status = 'open' 
    and deadline < now()
    and is_hidden = false;
end;
$$ language plpgsql;

-- Update task started_at when claimed
create or replace function update_task_on_claim()
returns trigger as $$
begin
  if new.status = 'in_progress' and old.status != 'in_progress' then
    new.started_at = now();
  end if;
  if new.status = 'completed' and old.status != 'completed' then
    new.completed_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger task_timestamp_on_change
before update on tasks
for each row
execute function update_task_on_claim();
