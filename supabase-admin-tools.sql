-- Admin Power Tools Schema
-- Run in Supabase SQL Editor

-- ============================================
-- COMMISSION CONTROL TABLE
-- ============================================
create table if not exists public.commission_settings (
  id uuid default gen_random_uuid() primary key,
  global_commission_percent numeric default 10,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by text
);

-- Individual commission overrides
create table if not exists public.user_commission_overrides (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique,
  commission_percent numeric not null,
  reason text,
  valid_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by text not null
);

-- ============================================
-- NOTIFICATIONS & BROADCAST TABLE
-- ============================================
create table if not exists public.broadcast_messages (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  content_translations jsonb, -- {en: "...", uz: "..."}
  notification_type text not null, -- push, telegram, in_app
  target_audience text not null, -- all, executors, customers, city_specific
  target_city text,
  language_filter text, -- ru, en, uz, all
  status text default 'draft', -- draft, scheduled, sending, sent, cancelled
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  total_recipients integer default 0,
  delivered_count integer default 0,
  read_count integer default 0,
  ai_generated boolean default false,
  ai_prompt text,
  created_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notification delivery log
create table if not exists public.notification_delivery_log (
  id uuid default gen_random_uuid() primary key,
  broadcast_id uuid references broadcast_messages(id) on delete cascade,
  user_id text not null,
  status text default 'pending', -- pending, sent, delivered, read, failed
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- AI CONTENT GENERATION LOG
-- ============================================
create table if not exists public.ai_content_log (
  id uuid default gen_random_uuid() primary key,
  prompt text not null,
  generated_content jsonb, -- array of 3 variants
  topic text,
  used_in_broadcast_id uuid references broadcast_messages(id),
  created_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- FINANCIAL MONITORING TABLE
-- ============================================
create table if not exists public.financial_transactions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id),
  user_id text not null,
  amount numeric not null,
  currency text default 'USDT',
  transaction_type text not null, -- escrow_hold, escrow_release, commission, refund, bonus
  commission_amount numeric default 0,
  commission_percent numeric default 10,
  status text not null, -- pending, completed, failed, disputed
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES
-- ============================================
create index user_commission_overrides_user_idx on user_commission_overrides (user_id);
create index broadcast_messages_status_idx on broadcast_messages (status);
create index broadcast_messages_created_idx on broadcast_messages (created_at desc);
create index notification_delivery_log_broadcast_idx on notification_delivery_log (broadcast_id);
create index notification_delivery_log_user_idx on notification_delivery_log (user_id);
create index notification_delivery_log_status_idx on notification_delivery_log (status);
create index ai_content_log_created_idx on ai_content_log (created_at desc);
create index financial_transactions_user_idx on financial_transactions (user_id);
create index financial_transactions_type_idx on financial_transactions (transaction_type);
create index financial_transactions_created_idx on financial_transactions (created_at desc);

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.commission_settings enable row level security;
alter table public.user_commission_overrides enable row level security;
alter table public.broadcast_messages enable row level security;
alter table public.notification_delivery_log enable row level security;
alter table public.ai_content_log enable row level security;
alter table public.financial_transactions enable row level security;

-- Commission: Only admins can modify (app-level check)
create policy "Public can view commission settings"
  on commission_settings for select
  using ( true );

-- User overrides: Only admins can modify
create policy "Users can view own commission override"
  on user_commission_overrides for select
  using ( auth.uid()::text = user_id );

-- Broadcast: Public can view sent messages
create policy "Public can view sent broadcasts"
  on broadcast_messages for select
  using ( status = 'sent' );

-- Delivery log: Users can view own
create policy "Users can view own delivery log"
  on notification_delivery_log for select
  using ( auth.uid()::text = user_id );

-- Financial: Only admins can view (app-level check)
create policy "Users can view own transactions"
  on financial_transactions for select
  using ( auth.uid()::text = user_id );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get commission for user (with override support)
create or replace function get_user_commission(p_user_id text)
returns numeric as $$
declare
  v_override numeric;
  v_global numeric;
begin
  -- Check for individual override
  select commission_percent into v_override
  from user_commission_overrides
  where user_id = p_user_id
  and (valid_until is null or valid_until > now());
  
  if found then
    return v_override;
  end if;
  
  -- Return global commission
  select global_commission_percent into v_global
  from commission_settings
  order by updated_at desc
  limit 1;
  
  return coalesce(v_global, 10);
end;
$$ language plpgsql security definer;

-- Update global commission
create or replace function update_global_commission(
  p_percent numeric,
  p_admin_id text
)
returns void as $$
begin
  insert into commission_settings (global_commission_percent, updated_by)
  values (p_percent, p_admin_id)
  on conflict (id) do update
  set global_commission_percent = p_percent,
      updated_at = now(),
      updated_by = p_admin_id;
end;
$$ language plpgsql security definer;

-- Set individual commission override
create or replace function set_user_commission_override(
  p_user_id text,
  p_percent numeric,
  p_reason text,
  p_valid_until timestamp with time zone default null,
  p_admin_id text
)
returns void as $$
begin
  insert into user_commission_overrides (
    user_id, commission_percent, reason, valid_until, created_by
  ) values (
    p_user_id, p_percent, p_reason, p_valid_until, p_admin_id
  )
  on conflict (user_id) do update
  set commission_percent = p_percent,
      reason = p_reason,
      valid_until = p_valid_until,
      created_at = now();
end;
$$ language plpgsql security definer;

-- Create broadcast message
create or replace function create_broadcast(
  p_title text,
  p_content text,
  p_content_translations jsonb,
  p_notification_type text,
  p_target_audience text,
  p_target_city text default null,
  p_language_filter text default 'all',
  p_ai_generated boolean default false,
  p_ai_prompt text default null,
  p_admin_id text
)
returns uuid as $$
declare
  v_broadcast_id uuid;
begin
  insert into broadcast_messages (
    title, content, content_translations, notification_type,
    target_audience, target_city, language_filter,
    ai_generated, ai_prompt, created_by, status
  ) values (
    p_title, p_content, p_content_translations, p_notification_type,
    p_target_audience, p_target_city, p_language_filter,
    p_ai_generated, p_ai_prompt, p_admin_id, 'draft'
  ) returning id into v_broadcast_id;
  
  return v_broadcast_id;
end;
$$ language plpgsql security definer;

-- Send broadcast (queue for delivery)
create or replace function send_broadcast(p_broadcast_id uuid)
returns integer as $$
declare
  v_broadcast record;
  v_recipients integer := 0;
begin
  -- Get broadcast details
  select * into v_broadcast
  from broadcast_messages
  where id = p_broadcast_id;
  
  if not found then
    raise exception 'Broadcast not found';
  end if;
  
  -- Update status
  update broadcast_messages
  set status = 'sending', sent_at = now()
  where id = p_broadcast_id;
  
  -- Queue notifications based on target audience
  if v_broadcast.target_audience = 'all' then
    insert into notification_delivery_log (broadcast_id, user_id)
    select p_broadcast_id, user_id
    from user_profiles
    where (v_broadcast.language_filter = 'all' or language = v_broadcast.language_filter);
    
    get diagnostics v_recipients = row_count;
    
  elsif v_broadcast.target_audience = 'executors' then
    insert into notification_delivery_log (broadcast_id, user_id)
    select p_broadcast_id, user_id
    from user_profiles
    where total_reviews > 0
    and (v_broadcast.language_filter = 'all' or language = v_broadcast.language_filter);
    
    get diagnostics v_recipients = row_count;
    
  elsif v_broadcast.target_audience = 'customers' then
    insert into notification_delivery_log (broadcast_id, user_id)
    select p_broadcast_id, user_id
    from user_profiles
    where tasks_created > 0
    and (v_broadcast.language_filter = 'all' or language = v_broadcast.language_filter);
    
    get diagnostics v_recipients = row_count;
    
  elsif v_broadcast.target_audience = 'city_specific' and v_broadcast.target_city is not null then
    insert into notification_delivery_log (broadcast_id, user_id)
    select p_broadcast_id, user_id
    from user_profiles
    where city = v_broadcast.target_city
    and (v_broadcast.language_filter = 'all' or language = v_broadcast.language_filter);
    
    get diagnostics v_recipients = row_count;
  end if;
  
  -- Update counts
  update broadcast_messages
  set total_recipients = v_recipients,
      status = 'sent',
      delivered_count = 0,
      read_count = 0
  where id = p_broadcast_id;
  
  return v_recipients;
end;
$$ language plpgsql security definer;

-- Log transaction with commission
create or replace function log_financial_transaction(
  p_task_id uuid,
  p_user_id text,
  p_amount numeric,
  p_type text,
  p_metadata jsonb default null
)
returns uuid as $$
declare
  v_commission_percent numeric;
  v_commission_amount numeric;
  v_transaction_id uuid;
begin
  -- Get commission for user
  v_commission_percent := get_user_commission(p_user_id);
  v_commission_amount := p_amount * (v_commission_percent / 100);
  
  insert into financial_transactions (
    task_id, user_id, amount, transaction_type,
    commission_amount, commission_percent, metadata, status
  ) values (
    p_task_id, p_user_id, p_amount, p_type,
    v_commission_amount, v_commission_percent, p_metadata, 'completed'
  ) returning id into v_transaction_id;
  
  return v_transaction_id;
end;
$$ language plpgsql security definer;

-- ============================================
-- INITIAL DATA
-- ============================================
-- Insert default commission setting
insert into commission_settings (global_commission_percent, updated_by)
values (10, 'system')
on conflict (id) do nothing;
