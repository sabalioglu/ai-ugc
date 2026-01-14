/*
  # Add Deduct Credits V2 RPC Function

  1. New Functions
    - `deduct_credits_v2` - Securely deducts credits from authenticated user's account
      - Parameters:
        - `p_job_id` (text) - Job ID for the transaction
        - `p_credits` (integer) - Number of credits to deduct
      - Returns: void
      - Security: Uses auth.uid() to ensure users can only deduct from their own account
      - Validates sufficient balance before deduction

  2. Security
    - Function runs with SECURITY DEFINER to safely update balances
    - Automatically uses auth.uid() for user identification
    - Records transaction in credit_transactions ledger
    - Raises exception if insufficient balance
*/

-- Create function to deduct credits using authenticated user context
CREATE OR REPLACE FUNCTION deduct_credits_v2(
  p_job_id text,
  p_credits integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_current_balance integer;
BEGIN
  -- Get the authenticated user's ID
  v_user_id := auth.uid();
  
  -- Validate user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to deduct credits';
  END IF;

  -- Validate amount is positive
  IF p_credits <= 0 THEN
    RAISE EXCEPTION 'Invalid amount: Credits amount must be positive';
  END IF;

  -- Check current balance
  SELECT credits_balance INTO v_current_balance
  FROM user_profiles
  WHERE id = v_user_id;

  -- Validate sufficient balance
  IF v_current_balance < p_credits THEN
    RAISE EXCEPTION 'Insufficient credits: You have % credits but need %', v_current_balance, p_credits;
  END IF;

  -- Insert into credit transactions ledger
  INSERT INTO credit_transactions (user_id, amount, description, metadata)
  VALUES (v_user_id, -p_credits, 'Video Generation', jsonb_build_object('job_id', p_job_id));

  -- Update user profile balance
  UPDATE user_profiles
  SET 
    credits_balance = credits_balance - p_credits,
    credits_used = credits_used + p_credits,
    updated_at = now()
  WHERE id = v_user_id;
END;
$$;
