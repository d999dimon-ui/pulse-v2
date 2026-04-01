-- Referral & Bonus System Schema
-- Run in Supabase SQL Editor

-- ============================================
-- REFERRALS TABLE
-- ============================================
create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id text not null, -- Who invited
  referred_id text not null, -- Who was invited
  referred_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_task_completed boolean default false,
  first_task_completed_at timestamp with time zone,
  bonus_awarded boolean default false,
  bonus_awarded_at timestamp with time zone,
  unique(referrer_id, referred_id)
);

-- ============================================
-- ACTIVE BONUSES TABLE
-- ============================================
create table if not exists public.active_bonuses (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  bonus_type text not null, -- referral, promo, compensation
  duration_hours numeric not null, -- e.g., 6 hours
  remaining_minutes numeric not null, -- Track remaining time
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean default false,
  source text, -- ref_user_id, promo_code, or ai_compensation
  reason text,
  issued_by text, -- admin_id or 'ai'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- PROMO CODES TABLE
-- ============================================
create table if not exists public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  bonus_duration_hours numeric not null,
  max_uses integer default 1,
  used_count integer default 0,
  valid_until timestamp with time zone,
  is_active boolean default true,
  target_user_id text, -- null = general use
  created_by text not null, -- admin_id
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- BONUS USAGE LOG (for admin tracking)
-- ============================================
create table if not exists public.bonus_log (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  action text not null, -- activated, expired, used, ai_awarded, admin_awarded
  bonus_type text,
  duration_hours numeric,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES
-- ============================================
create index referrals_referrer_idx on referrals (referrer_id);
create index referrals_referred_idx on referrals (referred_id);
create index active_bonuses_user_idx on active_bonuses (user_id);
create index active_bonuses_active_idx on active_bonuses (is_active) where is_active = true;
create index promo_codes_code_idx on promo_codes (code);
create index promo_codes_active_idx on promo_codes (is_active) where is_active = true;
create index bonus_log_user_idx on bonus_log (user_id);
create index bonus_log_created_idx on bonus_log (created_at desc);

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.referrals enable row level security;
alter table public.active_bonuses enable row level security;
alter table public.promo_codes enable row level security;
alter table public.bonus_log enable row level security;

-- Referrals: Users can view their own
create policy "Users can view own referrals"
  on referrals for select
  using ( auth.uid()::text = referrer_id or auth.uid()::text = referred_id );

-- Active bonuses: Users can view own
create policy "Users can view own bonuses"
  on active_bonuses for select
  using ( auth.uid()::text = user_id );

-- Promo codes: Public can view active general codes
create policy "Public can view active promo codes"
  on promo_codes for select
  using ( is_active = true and (target_user_id is null or target_user_id = auth.uid()::text) );

-- Bonus log: Users can view own
create policy "Users can view own bonus log"
  on bonus_log for select
  using ( auth.uid()::text = user_id );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Check if user has active bonus
create or replace function has_active_bonus(p_user_id text)
returns boolean as $$
begin
  return exists (
    select 1 from active_bonuses
    where user_id = p_user_id
    and is_active = true
    and expires_at > now()
  );
end;
$$ language plpgsql security definer;

-- Get remaining bonus time in minutes
create or replace function get_bonus_remaining_minutes(p_user_id text)
returns numeric as $$
declare
  v_remaining numeric;
begin
  select remaining_minutes into v_remaining
  from active_bonuses
  where user_id = p_user_id
  and is_active = true
  and expires_at > now()
  order by expires_at desc
  limit 1;
  
  return coalesce(v_remaining, 0);
end;
$$ language plpgsql security definer;

-- Activate bonus for user
create or replace function activate_bonus(
  p_user_id text,
  p_duration_hours numeric,
  p_bonus_type text,
  p_source text default null,
  p_reason text default null,
  p_issued_by text default null
)
returns uuid as $$
declare
  v_bonus_id uuid;
  v_expires_at timestamptz;
begin
  v_expires_at := now() + (p_duration_hours * interval '1 hour');
  
  -- Deactivate any existing active bonuses
  update active_bonuses
  set is_active = false
  where user_id = p_user_id and is_active = true;
  
  -- Create new bonus
  insert into active_bonuses (
    user_id, bonus_type, duration_hours, remaining_minutes,
    activated_at, expires_at, is_active, source, reason, issued_by
  ) values (
    p_user_id, p_bonus_type, p_duration_hours, p_duration_hours * 60,
    now(), v_expires_at, true, p_source, p_reason, p_issued_by
  ) returning id into v_bonus_id;
  
  -- Log action
  insert into bonus_log (user_id, action, bonus_type, duration_hours, details)
  values (
    p_user_id, 'activated', p_bonus_type, p_duration_hours,
    jsonb_build_object('source', p_source, 'reason', p_reason, 'issued_by', p_issued_by)
  );
  
  return v_bonus_id;
end;
$$ language plpgsql security definer;

-- Use promo code
create or replace function use_promo_code(p_code text, p_user_id text)
returns table (success boolean, message text, bonus_id uuid) as $$
declare
  v_promo record;
  v_bonus_id uuid;
begin
  -- Find promo code
  select * into v_promo
  from promo_codes
  where code = p_code
  and is_active = true
  and (valid_until is null or valid_until > now())
  and (target_user_id is null or target_user_id = p_user_id)
  and used_count < max_uses;
  
  if not found then
    return query select false, 'Invalid or expired promo code'::text, null::uuid;
    return;
  end if;
  
  -- Activate bonus
  v_bonus_id := activate_bonus(
    p_user_id,
    v_promo.bonus_duration_hours,
    'promo',
    p_code,
    'Promo code activated',
    'system'
  );
  
  -- Increment use count
  update promo_codes
  set used_count = used_count + 1
  where id = v_promo.id;
  
  return query select true, 'Promo code activated successfully!'::text, v_bonus_id;
end;
$$ language plpgsql security definer;

-- Award referral bonus (after first task completed)
create or replace function award_referral_bonus(p_referral_id uuid)
returns void as $$
declare
  v_referral record;
begin
  select * into v_referral from referrals where id = p_referral_id;
  
  if not found or v_referral.bonus_awarded then
    return;
  end if;
  
  -- Award 6 hours bonus to referrer
  perform activate_bonus(
    v_referral.referrer_id,
    6, -- 6 hours commission-free
    'referral',
    v_referral.referred_id,
    'Referred user completed first task',
    'system'
  );
  
  -- Mark as awarded
  update referrals
  set bonus_awarded = true,
      bonus_awarded_at = now()
  where id = p_referral_id;
end;
$$ language plpgsql security definer;

-- Auto-expire bonuses (trigger)
create or replace function expire_old_bonuses()
returns trigger as $$
begin
  update active_bonuses
  set is_active = false
  where expires_at <= now() and is_active = true;
  
  return new;
end;
$$ language plpgsql;

create trigger bonuses_auto_expire_trigger
  after insert on active_bonuses
  execute function expire_old_bonuses();

-- ============================================
-- UPDATE USER PROFILES
-- ============================================
alter table public.user_profiles 
add column if not exists referral_code text unique,
add column if not exists total_referrals integer default 0,
add column if not exists bonus_hours_earned numeric default 0;

-- Generate referral code for existing users
update user_profiles 
set referral_code = substring(md5(user_id || random()::text) from 1 for 8)
where referral_code is null;
