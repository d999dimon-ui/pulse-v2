-- Pulse Referral Program Update
-- Executor-only: 12 hours no commission after friend completes 5 tasks

-- Update bonus trigger to 12 hours (not 24)
CREATE OR REPLACE FUNCTION activate_referral_bonus()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if referred user completed 5 tasks
  IF NEW.tasks_completed_by_referral >= 5 AND OLD.tasks_completed_by_referral < 5 THEN
    -- Activate 12-hour no-commission promo for referrer (EXECUTOR ONLY)
    UPDATE referrals
    SET
      vip_promo_activated = true,
      vip_promo_expires_at = NOW() + INTERVAL '12 hours',
      bonus_status = 'active',
      updated_at = NOW()
    WHERE referral_id = NEW.referral_id;

    -- Update referrer profile (only if they are an executor)
    UPDATE profiles
    SET
      vip_status = 'gold',
      vip_expires_at = NOW() + INTERVAL '12 hours',
      updated_at = NOW()
    WHERE id = (SELECT referrer_id FROM referrals WHERE referral_id = NEW.referral_id)
      AND completed_tasks_as_executor > 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to activate bonus on task completion
CREATE TRIGGER referral_bonus_on_task_complete
AFTER UPDATE ON referrals
FOR EACH ROW
EXECUTE FUNCTION activate_referral_bonus();

-- Add wallet addresses for withdrawal
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usdt_wallet TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stars_balance NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usdt_balance NUMERIC DEFAULT 0;

-- Withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('stars', 'usdt')),
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS withdrawal_user_idx ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS withdrawal_status_idx ON withdrawal_requests(status);

-- Enable RLS on withdrawal_requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals"
  ON withdrawal_requests FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own withdrawals"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Function to process withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_user_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_wallet TEXT
) RETURNS UUID AS $$
DECLARE
  v_withdrawal_id UUID;
  v_balance NUMERIC;
BEGIN
  -- Check balance
  IF p_currency = 'stars' THEN
    SELECT stars_balance INTO v_balance FROM profiles WHERE id = p_user_id;
    IF v_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient Stars balance';
    END IF;

    -- Deduct from balance
    UPDATE profiles SET stars_balance = stars_balance - p_amount WHERE id = p_user_id;

  ELSIF p_currency = 'usdt' THEN
    SELECT usdt_balance INTO v_balance FROM profiles WHERE id = p_user_id;
    IF v_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient USDT balance';
    END IF;

    -- Deduct from balance
    UPDATE profiles SET usdt_balance = usdt_balance - p_amount WHERE id = p_user_id;
  END IF;

  -- Create withdrawal request
  INSERT INTO withdrawal_requests (user_id, amount, currency, wallet_address)
  VALUES (p_user_id, p_amount, p_currency, p_wallet)
  RETURNING id INTO v_withdrawal_id;

  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- VIP no-commission check function
CREATE OR REPLACE FUNCTION has_no_commission(p_user_id TEXT) RETURNS BOOLEAN AS $$
DECLARE
  v_is_active BOOLEAN;
BEGIN
  SELECT
    vip_status = 'gold'
    AND vip_expires_at > NOW()
  INTO v_is_active
  FROM profiles
  WHERE id = p_user_id;

  RETURN COALESCE(v_is_active, false);
END;
$$ LANGUAGE plpgsql;

-- Calculate fee with VIP discount
CREATE OR REPLACE FUNCTION calculate_fee(p_amount NUMERIC, p_user_id TEXT) RETURNS NUMERIC AS $$
DECLARE
  v_base_fee NUMERIC := p_amount * 0.10; -- 10% base commission
BEGIN
  -- No commission for VIP users (referral bonus)
  IF has_no_commission(p_user_id) THEN
    RETURN 0;
  END IF;

  RETURN v_base_fee;
END;
$$ LANGUAGE plpgsql;
