/*
  # Add Credits V2 RPC Function

  1. New Functions
    - `add_credits_v2` - Securely adds credits to authenticated user's account
      - Parameters:
        - `p_amount` (integer) - Number of credits to add
        - `p_description` (text) - Description of the purchase
      - Returns: void
      - Security: Uses auth.uid() to ensure users can only add credits to their own account

  2. Security
    - Function runs with SECURITY DEFINER to safely update balances
    - Automatically uses auth.uid() for user identification
    - Records transaction in credit_transactions ledger
*/

-- Create function to add credits using authenticated user context
CREATE OR REPLACE FUNCTION add_credits_v2(
  p_amount integer,
  p_description text DEFAULT 'Credits Purchased'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the authenticated user's ID
  v_user_id := auth.uid();
  
  -- Validate user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to purchase credits';
  END IF;

  -- Validate amount is positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount: Credits amount must be positive';
  END IF;

  -- Insert into credit transactions ledger
  INSERT INTO credit_transactions (user_id, amount, description)
  VALUES (v_user_id, p_amount, p_description);

  -- Update user profile balance
  UPDATE user_profiles
  SET 
    credits_balance = credits_balance + p_amount,
    updated_at = now()
  WHERE id = v_user_id;
END;
$$;