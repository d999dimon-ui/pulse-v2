-- Chat & Messages Schema for Pulse v2
-- Run in Supabase SQL Editor

-- ============================================
-- MESSAGES TABLE (Internal Chat)
-- ============================================
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  sender_id text not null,
  receiver_id text not null,
  content text not null,
  message_type text default 'text', -- text, image, voice, location
  media_url text,
  is_read boolean default false,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- TASK ADDRESSES TABLE (Exact Location)
-- ============================================
create table if not exists public.task_addresses (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade unique not null,
  exact_address text not null,
  latitude double precision not null,
  longitude double precision not null,
  map_provider text default 'google', -- google, yandex, osm
  place_id text,
  formatted_address text,
  city text,
  country text default 'KG',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- DYNAMIC CATEGORIES TABLE (AI Learning)
-- ============================================
create table if not exists public.dynamic_categories (
  id uuid default gen_random_uuid() primary key,
  user_input text not null,
  suggested_category text,
  ai_confidence numeric default 0,
  is_approved boolean default false,
  approved_by text,
  usage_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- CONTACT PRIVACY LOG
-- ============================================
create table if not exists public.contact_privacy_log (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  user_id text not null,
  contacts_visible boolean default true,
  hidden_at timestamp with time zone,
  reason text, -- completed, cancelled, manual
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES
-- ============================================
create index messages_task_idx on messages (task_id);
create index messages_sender_idx on messages (sender_id);
create index messages_receiver_idx on messages (receiver_id);
create index messages_created_idx on messages (created_at desc);
create index messages_unread_idx on messages (receiver_id, is_read) where is_read = false;
create index task_addresses_task_idx on task_addresses (task_id);
create index task_addresses_location_idx on task_addresses using gist (latitude, longitude);
create index dynamic_categories_approved_idx on dynamic_categories (is_approved) where is_approved = true;
create index contact_privacy_task_idx on contact_privacy_log (task_id);

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.messages enable row level security;
alter table public.task_addresses enable row level security;
alter table public.dynamic_categories enable row level security;
alter table public.contact_privacy_log enable row level security;

-- Messages: Task participants can view
create policy "Task participants can view messages"
  on messages for select
  using (
    auth.uid()::text = sender_id
    or auth.uid()::text = receiver_id
  );

create policy "Task participants can send messages"
  on messages for insert
  with check (
    auth.uid()::text = sender_id
    and exists (
      select 1 from tasks
      where id = task_id
      and (user_id = auth.uid()::text or executor_id = auth.uid()::text)
    )
  );

-- Task addresses: Public can view
create policy "Public can view task addresses"
  on task_addresses for select
  using ( true );

create policy "Task creators can set addresses"
  on task_addresses for insert
  with check ( auth.uid()::text = (select user_id from tasks where id = task_id) );

-- Dynamic categories: Public can view approved
create policy "Public can view approved categories"
  on dynamic_categories for select
  using ( is_approved = true );

create policy "Users can suggest categories"
  on dynamic_categories for insert
  with check ( true );

-- Contact privacy: Users can view own
create policy "Users can view own privacy log"
  on contact_privacy_log for select
  using ( auth.uid()::text = user_id );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Hide contacts after task completion
create or replace function hide_contacts_on_completion()
returns trigger as $$
begin
  if new.status = 'completed' or new.status = 'cancelled' then
    -- Hide contacts for both parties
    insert into contact_privacy_log (task_id, user_id, contacts_visible, hidden_at, reason)
    values 
      (new.id, new.user_id, false, now(), new.status),
      (new.id, new.executor_id, false, now(), new.status);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- AI Category suggestion (to be called from edge function)
create or replace function suggest_category(p_user_input text)
returns text as $$
declare
  v_existing record;
  v_suggested text;
begin
  -- Check if similar category exists
  select * into v_existing
  from dynamic_categories
  where lower(user_input) = lower(p_user_input)
  and is_approved = true
  limit 1;
  
  if found then
    return v_existing.suggested_category;
  end if;
  
  -- Simple keyword matching (replace with AI call in production)
  if lower(p_user_input) like '%telegram%' or lower(p_user_input) like '%bot%' then
    v_suggested := 'it';
  elsif lower(p_user_input) like '%repair%' or lower(p_user_input) like '%fix%' then
    v_suggested := 'repair';
  elsif lower(p_user_input) like '%translate%' or lower(p_user_input) like '%translation%' then
    v_suggested := 'translation';
  elsif lower(p_user_input) like '%deliver%' or lower(p_user_input) like '%delivery%' then
    v_suggested := 'delivery';
  elsif lower(p_user_input) like '%clean%' then
    v_suggested := 'cleaning';
  elsif lower(p_user_input) like '%teach%' or lower(p_user_input) like '%tutor%' then
    v_suggested := 'tutoring';
  else
    v_suggested := 'other';
  end if;
  
  -- Save suggestion for admin review
  insert into dynamic_categories (user_input, suggested_category, ai_confidence)
  values (p_user_input, v_suggested, 0.8)
  on conflict (user_input) do update
  set usage_count = dynamic_categories.usage_count + 1,
      updated_at = now();
  
  return v_suggested;
end;
$$ language plpgsql security definer;

-- Get unread message count for user
create or replace function get_unread_message_count(p_user_id text)
returns integer as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from messages
  where receiver_id = p_user_id
  and is_read = false;
  
  return v_count;
end;
$$ language plpgsql security definer;

-- Mark messages as read
create or replace function mark_messages_as_read(p_task_id uuid, p_user_id text)
returns void as $$
begin
  update messages
  set is_read = true,
      read_at = now()
  where task_id = p_task_id
  and receiver_id = p_user_id
  and is_read = false;
end;
$$ language plpgsql security definer;

-- ============================================
-- TRIGGERS
-- ============================================

create trigger hide_contacts_trigger
  after update on tasks
  for each row
  when (old.status is distinct from new.status and new.status in ('completed', 'cancelled'))
  execute function hide_contacts_on_completion();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Pre-populate approved categories
insert into dynamic_categories (user_input, suggested_category, is_approved, ai_confidence)
values
  ('IT-услуги', 'it', true, 1.0),
  ('Ремонт', 'repair', true, 1.0),
  ('Переводы', 'translation', true, 1.0),
  ('Доставка', 'delivery', true, 1.0),
  ('Клининг', 'cleaning', true, 1.0),
  ('Репетиторство', 'tutoring', true, 1.0),
  ('Настройка Telegram-бота', 'it', true, 0.95),
  ('Установка Windows', 'it', true, 0.90),
  ('Ремонт холодильника', 'repair', true, 0.95),
  ('Перевод документов', 'translation', true, 0.95)
on conflict (user_input) do nothing;
