-- Comprehensive Points System Fix
-- Date: 2025-07-29
-- Description: Ensures all tables, constraints, and functions are properly configured

-- 1. Ensure user_points table has all necessary columns
ALTER TABLE public.user_points ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0;
ALTER TABLE public.user_points ADD COLUMN IF NOT EXISTS total_earned integer DEFAULT 0;
ALTER TABLE public.user_points ADD COLUMN IF NOT EXISTS total_spent integer DEFAULT 0;
ALTER TABLE public.user_points ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.user_points ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. Ensure point_transactions table exists with proper structure
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  points integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent')),
  source_type text NOT NULL,
  source_id uuid,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT point_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT point_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON public.point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_source ON public.point_transactions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);

-- 4. Ensure achievements table has points_reward column
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS points_reward integer DEFAULT 10;

-- 5. Update existing achievements to have proper points_reward
UPDATE public.achievements 
SET points_reward = CASE 
  WHEN achievement_id = 'first_checkin' THEN 10
  WHEN achievement_id = 'checkins_10' THEN 15
  WHEN achievement_id = 'checkins_50' THEN 25
  WHEN achievement_id = 'checkins_100' THEN 75
  WHEN achievement_id = 'streak_3' THEN 20
  WHEN achievement_id = 'streak_7' THEN 40
  WHEN achievement_id = 'streak_30' THEN 75
  WHEN achievement_id = 'first_antitodo' THEN 15
  WHEN achievement_id = 'antitodo_5' THEN 25
  WHEN achievement_id = 'antitodo_15' THEN 40
  WHEN achievement_id = 'antitodo_30' THEN 60
  WHEN achievement_id = 'wellness_week' THEN 20
  ELSE 10
END
WHERE points_reward IS NULL OR points_reward = 10;

-- 6. Drop and recreate RPC functions with proper error handling
DROP FUNCTION IF EXISTS award_user_points(uuid, integer, text, uuid, text);
DROP FUNCTION IF EXISTS award_user_points(uuid, integer, text, uuid);
DROP FUNCTION IF EXISTS award_user_points(uuid, integer, text);
DROP FUNCTION IF EXISTS spend_user_points(uuid, integer, text, uuid, text);
DROP FUNCTION IF EXISTS spend_user_points(uuid, integer, text, uuid);
DROP FUNCTION IF EXISTS spend_user_points(uuid, integer, text);

-- 7. Create improved award_user_points function
CREATE OR REPLACE FUNCTION award_user_points(
  p_user_id uuid,
  p_points integer,
  p_source_type text,
  p_source_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_total integer;
  v_transaction_id uuid;
BEGIN
  -- Validate inputs
  IF p_points <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Points must be positive'
    );
  END IF;

  -- Insert point transaction record
  INSERT INTO point_transactions (
    user_id, 
    points, 
    transaction_type, 
    source_type, 
    source_id, 
    description
  ) VALUES (
    p_user_id, 
    p_points, 
    'earned', 
    p_source_type, 
    p_source_id, 
    COALESCE(p_description, 'Points earned')
  ) RETURNING id INTO v_transaction_id;

  -- Update or create user_points record
  INSERT INTO user_points (user_id, total_points, total_earned, total_spent)
  VALUES (p_user_id, p_points, p_points, 0)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = user_points.total_points + p_points,
    total_earned = user_points.total_earned + p_points,
    updated_at = now()
  RETURNING total_points INTO v_new_total;

  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_total', v_new_total,
    'points_awarded', p_points
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 8. Create improved spend_user_points function
CREATE OR REPLACE FUNCTION spend_user_points(
  p_user_id uuid,
  p_points integer,
  p_source_type text,
  p_source_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_total integer;
  v_transaction_id uuid;
  v_current_points integer;
BEGIN
  -- Validate inputs
  IF p_points <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Points must be positive'
    );
  END IF;

  -- Get current points
  SELECT total_points INTO v_current_points
  FROM user_points
  WHERE user_id = p_user_id;

  -- Check if user has enough points
  IF v_current_points IS NULL OR v_current_points < p_points THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient points',
      'current_points', COALESCE(v_current_points, 0),
      'required_points', p_points
    );
  END IF;

  -- Insert point transaction record
  INSERT INTO point_transactions (
    user_id, 
    points, 
    transaction_type, 
    source_type, 
    source_id, 
    description
  ) VALUES (
    p_user_id, 
    p_points, 
    'spent', 
    p_source_type, 
    p_source_id, 
    COALESCE(p_description, 'Points spent')
  ) RETURNING id INTO v_transaction_id;

  -- Update user_points record
  UPDATE user_points
  SET 
    total_points = total_points - p_points,
    total_spent = total_spent + p_points,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING total_points INTO v_new_total;

  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_total', v_new_total,
    'points_spent', p_points
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 9. Grant execute permissions
GRANT EXECUTE ON FUNCTION award_user_points TO authenticated;
GRANT EXECUTE ON FUNCTION spend_user_points TO authenticated;

-- 10. Create trigger to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Add triggers if they don't exist
DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;
CREATE TRIGGER update_user_points_updated_at 
  BEFORE UPDATE ON user_points 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Ensure plant_store_items table has proper structure
ALTER TABLE public.plant_store_items ADD COLUMN IF NOT EXISTS price integer DEFAULT 10;
ALTER TABLE public.plant_store_items ADD COLUMN IF NOT EXISTS rarity text DEFAULT 'common';
ALTER TABLE public.plant_store_items ADD COLUMN IF NOT EXISTS xp_bonus integer DEFAULT 0;

-- 13. Ensure user_store_purchases table has proper structure  
ALTER TABLE public.user_store_purchases ADD COLUMN IF NOT EXISTS total_cost integer;
ALTER TABLE public.user_store_purchases ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;
ALTER TABLE public.user_store_purchases ADD COLUMN IF NOT EXISTS used_quantity integer DEFAULT 0;
ALTER TABLE public.user_store_purchases ADD COLUMN IF NOT EXISTS purchased_at timestamp with time zone DEFAULT now();

-- 14. Fix any inconsistent data
-- Initialize user_points for existing users who don't have records
INSERT INTO user_points (user_id, total_points, total_earned, total_spent)
SELECT u.id, 0, 0, 0
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_points up WHERE up.user_id = u.id
);

-- 15. Add comments for documentation
COMMENT ON FUNCTION award_user_points IS 'Awards points to a user and records the transaction';
COMMENT ON FUNCTION spend_user_points IS 'Spends points from a user if they have sufficient balance';
COMMENT ON TABLE point_transactions IS 'Records all point earning and spending transactions';
COMMENT ON TABLE user_points IS 'Tracks total points balance and statistics for each user';

-- 16. Create view for easy point transaction analysis
CREATE OR REPLACE VIEW user_points_summary AS
SELECT 
  u.id as user_id,
  u.username,
  up.total_points,
  up.total_earned,
  up.total_spent,
  up.updated_at as last_point_activity,
  COUNT(pt.id) as total_transactions,
  COUNT(CASE WHEN pt.transaction_type = 'earned' THEN 1 END) as earning_transactions,
  COUNT(CASE WHEN pt.transaction_type = 'spent' THEN 1 END) as spending_transactions
FROM users u
LEFT JOIN user_points up ON u.id = up.user_id
LEFT JOIN point_transactions pt ON u.id = pt.user_id
GROUP BY u.id, u.username, up.total_points, up.total_earned, up.total_spent, up.updated_at;

COMMENT ON VIEW user_points_summary IS 'Summary view of user points with transaction statistics'; 