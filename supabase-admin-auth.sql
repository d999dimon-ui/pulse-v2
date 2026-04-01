-- Admin Authentication Schema
-- Run in Supabase SQL Editor

-- ============================================
-- ADMIN CONFIG TABLE
-- ============================================
create table if not exists public.admin_config (
  id uuid default gen_random_uuid() primary key,
  login text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ADMIN SESSIONS TABLE (for tracking)
-- ============================================
create table if not exists public.admin_sessions (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references admin_config(id) on delete cascade,
  token text unique not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ADMIN AUDIT LOG (track all admin actions)
-- ============================================
create table if not exists public.admin_audit_log (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references admin_config(id),
  action text not null, -- login, logout, update_credentials, delete_task, etc.
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES
-- ============================================
create index admin_config_login_idx on admin_config (login);
create index admin_sessions_token_idx on admin_sessions (token);
create index admin_sessions_expires_idx on admin_sessions (expires_at);
create index admin_audit_log_admin_idx on admin_audit_log (admin_id);
create index admin_audit_log_created_idx on admin_audit_log (created_at desc);

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.admin_config enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.admin_audit_log enable row level security;

-- No one can read admin config except through RPC
create policy "Admin config is private"
  on admin_config for all
  using (false)
  with check (false);

-- Sessions: users can only read their own
create policy "Users can view own sessions"
  on admin_sessions for select
  using (token = current_setting('app.admin_token', true));

-- Audit log: only admins can view
create policy "Admins can view audit log"
  on admin_audit_log for select
  using (false);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to verify admin login
create or replace function verify_admin_login(p_login text, p_password text)
returns table (success boolean, admin_id uuid, message text) as $$
declare
  v_stored_hash text;
  v_admin_id uuid;
begin
  -- Check if admin_config has any records
  select id, password_hash into v_admin_id, v_stored_hash
  from admin_config
  limit 1;
  
  -- If no config exists, use default credentials
  if v_admin_id is null then
    if p_login = 'admin' and p_password = 'd2551395' then
      -- Create default admin config
      insert into admin_config (login, password_hash)
      values ('admin', crypt(p_password, gen_salt('bf')))
      returning id into v_admin_id;
      
      return query select true, v_admin_id, 'Login successful (default credentials)'::text;
    else
      return query select false, null::uuid, 'Invalid credentials'::text;
    end if;
  else
    -- Use stored credentials
    if p_login = (select login from admin_config limit 1) and 
       p_password = v_stored_hash then
      return query select true, v_admin_id, 'Login successful'::text;
    else
      return query select false, null::uuid, 'Invalid credentials'::text;
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- Function to update admin credentials
create or replace function update_admin_credentials(p_login text, p_password text)
returns table (success boolean, message text) as $$
begin
  -- Update or insert admin config
  insert into admin_config (login, password_hash, updated_at)
  values (p_login, crypt(p_password, gen_salt('bf')), now())
  on conflict (login) do update
  set password_hash = crypt(p_password, gen_salt('bf')),
      updated_at = now();
  
  -- Delete all existing sessions (force re-login)
  delete from admin_sessions;
  
  return query select true, 'Credentials updated successfully'::text;
end;
$$ language plpgsql security definer;

-- Function to create admin session
create or replace function create_admin_session(p_admin_id uuid)
returns text as $$
declare
  v_token text;
  v_expires_at timestamptz;
begin
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := now() + interval '24 hours';
  
  insert into admin_sessions (admin_id, token, expires_at)
  values (p_admin_id, v_token, v_expires_at);
  
  return v_token;
end;
$$ language plpgsql security definer;

-- Function to verify admin session
create or replace function verify_admin_session(p_token text)
returns table (is_valid boolean, admin_id uuid) as $$
begin
  return query
  select true, admin_id
  from admin_sessions
  where token = p_token and expires_at > now()
  limit 1;
  
  if not found then
    return query select false, null::uuid;
  end if;
end;
$$ language plpgsql security definer;

-- Function to log admin action
create or replace function log_admin_action(p_admin_id uuid, p_action text, p_details jsonb default null, p_ip_address text default null)
returns void as $$
begin
  insert into admin_audit_log (admin_id, action, details, ip_address)
  values (p_admin_id, p_action, p_details, p_ip_address);
end;
$$ language plpgsql security definer;

-- ============================================
-- CLEANUP OLD SESSIONS (auto)
-- ============================================
create or replace function cleanup_expired_sessions()
returns trigger as $$
begin
  delete from admin_sessions where expires_at < now();
  return new;
end;
$$ language plpgsql;

create trigger sessions_cleanup_trigger
  after insert on admin_sessions
  execute function cleanup_expired_sessions();

-- ============================================
-- INITIAL SETUP (optional - will auto-create on first login)
-- ============================================
-- Default credentials: admin / d2551395
-- No need to insert manually - function handles it
