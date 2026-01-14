-- Create a table to track credit history (ledger)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- Positive for purchase, negative for usage
  description text NOT NULL, -- e.g., "Purchased Starter Pack", "Video Generation Job 123"
  metadata jsonb, -- Extra info like job_id or payment_id
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on transaction ledger
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- FUNCTION: Securely ADD credits (for purchases or refunds)
CREATE OR REPLACE FUNCTION add_credits(user_id uuid, amount integer, description text DEFAULT 'Credits Purchased')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to update balances safely
AS $$
BEGIN
  -- 1. Insert into ledger
  INSERT INTO credit_transactions (user_id, amount, description)
  VALUES (user_id, amount, description);

  -- 2. Update user profile balance
  UPDATE user_profiles
  SET 
    credits_balance = credits_balance + amount,
    updated_at = now()
  WHERE id = user_id;
END;
$$;

-- FUNCTION: Securely DEDUCT credits (for usage)
CREATE OR REPLACE FUNCTION deduct_credits(job_id text, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance integer;
  uid uuid;
BEGIN
  -- Get current user ID from auth context
  uid := auth.uid();
  
  -- Check balance
  SELECT credits_balance INTO current_balance
  FROM user_profiles
  WHERE id = uid;

  IF current_balance < amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- 1. Insert into ledger
  INSERT INTO credit_transactions (user_id, amount, description, metadata)
  VALUES (uid, -amount, 'Video Generation', jsonb_build_object('job_id', job_id));

  -- 2. Update user profile
  UPDATE user_profiles
  SET 
    credits_balance = credits_balance - amount,
    credits_used = credits_used + amount,
    updated_at = now()
  WHERE id = uid;
END;
$$;

-- FUNCTION: Handle Job Failures & Refunds Automatically
CREATE OR REPLACE FUNCTION handle_failed_job_refund()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If status changes to 'failed' AND it wasn't already failed
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    -- Refund the cost
    UPDATE user_profiles
    SET 
      credits_balance = credits_balance + NEW.credits_cost,
      credits_used = credits_used - NEW.credits_cost -- Reverse usage stats
    WHERE id = NEW.user_id;

    -- Add ledger entry for refund
    INSERT INTO credit_transactions (user_id, amount, description, metadata)
    VALUES (NEW.user_id, NEW.credits_cost, 'Refund for Failed Job', jsonb_build_object('job_id', NEW.job_id));
  END IF;
  RETURN NEW;
END;
$$;

-- TRIGGER: Watch for failed jobs
DROP TRIGGER IF EXISTS on_job_failed ON video_jobs;
CREATE TRIGGER on_job_failed
  AFTER UPDATE ON video_jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_failed_job_refund();
