-- Innovations, Security & Moderation Schema
-- Run in Supabase SQL Editor

-- ============================================
-- TRANSACTION LOG (Escrow Monitoring)
-- ============================================
create table if not exists public.transaction_log (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id),
  user_id text not null,
  amount numeric not null,
  currency text default 'USDT',
  status text not null, -- hold, paid, refund, disputed
  transaction_type text, -- escrow_hold, escrow_release, escrow_refund, commission
  escrow_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- CHAT MONITORING (Anti-Fraud)
-- ============================================
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id),
  sender_id text not null,
  receiver_id text not null,
  message text not null,
  is_flagged boolean default false,
  flag_reason text,
  warning_sent boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- FRAUD ALERTS TABLE
-- ============================================
create table if not exists public.fraud_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  alert_type text not null, -- off_platform_attempt, suspicious_activity, multiple_reports
  severity text default 'medium', -- low, medium, high, critical
  details jsonb,
  is_resolved boolean default false,
  resolved_by text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- FLASH TASKS (Urgent Orders)
-- ============================================
alter table public.tasks add column if not exists is_flash_task boolean default false;
alter table public.tasks add column if not exists flash_xp_bonus numeric default 20;
alter table public.tasks add column if not exists urgent_until timestamp with time zone;

-- ============================================
-- USER PREFERENCES (Smart Filters)
-- ============================================
alter table public.user_profiles add column if not exists preferred_categories jsonb default '[]'::jsonb;
alter table public.user_profiles add column if not exists min_reward numeric default 0;
alter table public.user_profiles add column if not exists max_distance_km numeric default 50;
alter table public.user_profiles add column if not exists dark_mode boolean default true;
alter table public.user_profiles add column if not exists notifications_enabled boolean default true;

-- ============================================
-- FEEDBACK & IDEAS TABLE
-- ============================================
create table if not exists public.feedback_ideas (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,
  description text,
  category text, -- feature, bug, improvement, other
  status text default 'pending', -- pending, reviewing, approved, rejected, implemented
  upvotes integer default 0,
  downvotes integer default 0,
  admin_response text,
  reward_hours numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- FEEDBACK VOTES
-- ============================================
create table if not exists public.feedback_votes (
  id uuid default gen_random_uuid() primary key,
  feedback_id uuid references feedback_ideas(id) on delete cascade,
  user_id text not null,
  vote_type text not null, -- upvote, downvote
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(feedback_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
create index transaction_log_user_idx on transaction_log (user_id);
create index transaction_log_status_idx on transaction_log (status);
create index transaction_log_task_idx on transaction_log (task_id);
create index chat_messages_flagged_idx on chat_messages (is_flagged) where is_flagged = true;
create index fraud_alerts_user_idx on fraud_alerts (user_id);
create index fraud_alerts_resolved_idx on fraud_alerts (is_resolved) where is_resolved = false;
create index tasks_flash_idx on tasks (is_flash_task) where is_flash_task = true;
create index feedback_ideas_status_idx on feedback_ideas (status);
create index feedback_ideas_upvotes_idx on feedback_ideas (upvotes desc);

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.transaction_log enable row level security;
alter table public.chat_messages enable row level security;
alter table public.fraud_alerts enable row level security;
alter table public.feedback_ideas enable row level security;
alter table public.feedback_votes enable row level security;

-- Transaction log: Users can view own, admins can view all
create policy "Users can view own transactions"
  on transaction_log for select
  using ( auth.uid()::text = user_id );

-- Chat messages: Participants can view own chats
create policy "Chat participants can view messages"
  on chat_messages for select
  using ( 
    auth.uid()::text = sender_id 
    or auth.uid()::text = receiver_id 
  );

-- Fraud alerts: Only admins can view (app-level check)
create policy "Admins can view fraud alerts"
  on fraud_alerts for select
  using ( false );

-- Feedback: Public can view, users can create own
create policy "Public can view feedback"
  on feedback_ideas for select
  using ( true );

create policy "Users can create feedback"
  on feedback_ideas for insert
  with check ( auth.uid()::text = user_id );

create policy "Users can vote on feedback"
  on feedback_votes for all
  using ( auth.uid()::text = user_id );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Log escrow transaction
create or replace function log_escrow_transaction(
  p_task_id uuid,
  p_user_id text,
  p_amount numeric,
  p_status text,
  p_type text,
  p_escrow_data jsonb default null
)
returns uuid as $$
declare
  v_log_id uuid;
begin
  insert into transaction_log (
    task_id, user_id, amount, status, transaction_type, escrow_data
  ) values (
    p_task_id, p_user_id, p_amount, p_status, p_type, p_escrow_data
  ) returning id into v_log_id;
  
  return v_log_id;
end;
$$ language plpgsql security definer;

-- Scan message for fraud keywords
create or replace function scan_message_for_fraud(p_message text)
returns boolean as $$
declare
  v_fraud_keywords text[] := array[
    'без комиссии', 'без процента', 'напрямую', 'на карту',
    'off platform', 'direct transfer', 'no commission',
    'telegram', 'whatsapp', 'instagram', 'phone number',
    'переведи', 'скинь на', 'card number', 'bank details'
  ];
  v_keyword text;
begin
  foreach v_keyword in array v_fraud_keywords loop
    if lower(p_message) like '%' || lower(v_keyword) || '%' then
      return true;
    end if;
  end loop;
  
  return false;
end;
$$ language plpgsql security definer;

-- Create fraud alert
create or replace function create_fraud_alert(
  p_user_id text,
  p_alert_type text,
  p_severity text,
  p_details jsonb
)
returns uuid as $$
declare
  v_alert_id uuid;
begin
  insert into fraud_alerts (
    user_id, alert_type, severity, details
  ) values (
    p_user_id, p_alert_type, p_severity, p_details
  ) returning id into v_alert_id;
  
  return v_alert_id;
end;
$$ language plpgsql security definer;

-- Vote on feedback
create or replace function vote_feedback(
  p_feedback_id uuid,
  p_user_id text,
  p_vote_type text
)
returns void as $$
declare
  v_existing_vote record;
begin
  -- Check existing vote
  select * into v_existing_vote
  from feedback_votes
  where feedback_id = p_feedback_id and user_id = p_user_id;
  
  if found then
    -- Update existing vote
    if v_existing_vote.vote_type != p_vote_type then
      update feedback_votes
      set vote_type = p_vote_type
      where id = v_existing_vote.id;
      
      -- Update feedback counts
      update feedback_ideas
      set upvotes = upvotes + (case when p_vote_type = 'upvote' then 1 else -1 end),
          downvotes = downvotes + (case when p_vote_type = 'downvote' then 1 else -1 end)
      where id = p_feedback_id;
    end if;
  else
    -- Insert new vote
    insert into feedback_votes (feedback_id, user_id, vote_type)
    values (p_feedback_id, p_user_id, p_vote_type);
    
    -- Update feedback counts
    update feedback_ideas
    set upvotes = upvotes + (case when p_vote_type = 'upvote' then 1 else 0 end),
        downvotes = downvotes + (case when p_vote_type = 'downvote' then 1 else 0 end)
    where id = p_feedback_id;
  end if;
end;
$$ language plpgsql security definer;

-- Award bonus for implemented feedback
create or replace function award_feedback_bonus(
  p_feedback_id uuid,
  p_reward_hours numeric,
  p_admin_id text
)
returns void as $$
declare
  v_user_id text;
begin
  select user_id into v_user_id from feedback_ideas where id = p_feedback_id;
  
  if found then
    -- Activate bonus
    perform activate_bonus(
      v_user_id,
      p_reward_hours,
      'feedback_reward',
      'feedback_' || p_feedback_id::text,
      'Feedback implemented: ' || p_feedback_id::text,
      p_admin_id
    );
    
    -- Update feedback status
    update feedback_ideas
    set status = 'implemented',
        reward_hours = p_reward_hours,
        updated_at = now()
    where id = p_feedback_id;
  end if;
end;
$$ language plpgsql security definer;

-- Trigger: Auto-scan chat messages
create or replace function scan_chat_message_trigger()
returns trigger as $$
declare
  v_is_fraud boolean;
begin
  v_is_fraud := scan_message_for_fraud(new.message);
  
  if v_is_fraud then
    new.is_flagged := true;
    new.flag_reason := 'Potential off-platform attempt detected';
    
    -- Create fraud alert
    perform create_fraud_alert(
      new.sender_id,
      'off_platform_attempt',
      'medium',
      jsonb_build_object(
        'message', new.message,
        'task_id', new.task_id,
        'timestamp', new.created_at
      )
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger chat_message_scan_trigger
  before insert on chat_messages
  for each row
  execute function scan_chat_message_trigger();

-- Trigger: Update feedback timestamp
create or replace function update_feedback_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger feedback_timestamp_trigger
  before update on feedback_ideas
  for each row
  execute function update_feedback_timestamp();

-- ============================================
-- INITIAL DATA
-- ============================================
-- Insert disclaimer templates
insert into public.feedback_ideas (user_id, title, description, category, status)
values 
  ('system', 'Dark Mode Improvements', 'Add more OLED-friendly colors', 'improvement', 'pending'),
  ('system', 'Flash Tasks Notification', 'Push notifications for urgent tasks in my area', 'feature', 'pending'),
  ('system', 'Category Filters', 'Better filtering by task categories', 'improvement', 'pending');
