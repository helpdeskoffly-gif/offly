-- SAFE VERSION: Fix for Achievements and Points System
-- Run this in your Supabase SQL editor
-- This version handles existing data and conflicts safely

-- 1. First, let's safely handle the achievement definitions
-- Check if the table exists and create if needed
DO $$ 
BEGIN
    -- Create achievement_definitions table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'achievement_definitions') THEN
        CREATE TABLE achievement_definitions (
            id text PRIMARY KEY,
            name text NOT NULL,
            description text,
            points_reward integer DEFAULT 10,
            category text DEFAULT 'milestone',
            target integer DEFAULT 1,
            icon text,
            created_at timestamp with time zone DEFAULT now()
        );
    END IF;
END $$;

-- 2. Safely insert achievement definitions
INSERT INTO achievement_definitions (id, name, description, points_reward, category, target, icon) VALUES
  ('first_checkin', 'First Steps', 'Complete your first daily check-in', 10, 'milestone', 1, 'CheckCircle'),
  ('checkins_5', 'Getting Started', 'Complete 5 daily check-ins', 25, 'milestone', 5, 'Target'),
  ('checkins_10', 'Dedicated Tracker', 'Complete 10 daily check-ins', 50, 'milestone', 10, 'Trophy'),
  ('checkins_25', 'Consistency Builder', 'Complete 25 daily check-ins', 100, 'milestone', 25, 'Award'),
  ('checkins_50', 'Mood Expert', 'Complete 50 daily check-ins', 200, 'milestone', 50, 'Star'),
  ('checkins_100', 'Centurion', 'Complete 100 daily check-ins', 500, 'milestone', 100, 'Crown'),
  
  -- Streak achievements
  ('streak_3', 'Getting Started', 'Maintain a 3-day check-in streak', 15, 'streak', 3, 'Flame'),
  ('streak_7', 'Weekly Warrior', 'Maintain a 7-day check-in streak', 50, 'streak', 7, 'Fire'),
  ('streak_14', 'Fortnight Fighter', 'Maintain a 14-day check-in streak', 100, 'streak', 14, 'Zap'),
  ('streak_30', 'Monthly Master', 'Maintain a 30-day check-in streak', 250, 'streak', 30, 'Lightning'),
  ('streak_100', 'Streak Legend', 'Maintain a 100-day check-in streak', 1000, 'streak', 100, 'Bolt'),
  
  -- Anti-todo/Wellness achievements
  ('first_antitodo', 'Mindful Explorer', 'Complete your first anti-todo item', 10, 'wellness', 1, 'Heart'),
  ('antitodo_5', 'Wellness Enthusiast', 'Complete 5 anti-todo items', 25, 'wellness', 5, 'HeartHandshake'),
  ('antitodo_15', 'Mindfulness Master', 'Complete 15 anti-todo items', 75, 'wellness', 15, 'Infinity'),
  ('antitodo_30', 'Zen Warrior', 'Complete 30 anti-todo items', 150, 'wellness', 30, 'Compass'),
  
  -- Plant achievements
  ('first_plant', 'Plant Parent', 'Grow your first plant', 15, 'plant', 1, 'Sprout'),
  ('plant_level_2', 'Growing Green', 'Reach plant level 2', 25, 'plant', 2, 'Leaf'),
  ('plant_level_3', 'Garden Guru', 'Reach plant level 3', 50, 'plant', 3, 'TreePine'),
  ('plant_level_4', 'Master Gardener', 'Reach plant level 4', 100, 'plant', 4, 'Trees'),
  ('plant_complete', 'Harvest Master', 'Complete a full plant lifecycle', 200, 'plant', 1, 'Mountain'),
  
  -- Timing/Consistency achievements
  ('daily_consistency', 'Daily Devotion', 'Check in for 5 consecutive days', 30, 'timing', 5, 'Calendar'),
  ('weekly_consistency', 'Weekly Warrior', 'Complete at least 5 check-ins in a week', 40, 'timing', 5, 'CalendarDays'),
  ('morning_person', 'Early Bird', 'Complete 10 morning check-ins', 35, 'timing', 10, 'Sunrise'),
  ('night_owl', 'Night Owl', 'Complete 10 evening check-ins', 35, 'timing', 10, 'Moon')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  points_reward = EXCLUDED.points_reward,
  category = EXCLUDED.category,
  target = EXCLUDED.target,
  icon = EXCLUDED.icon;

-- 3. Create the main achievement calculation function
CREATE OR REPLACE FUNCTION calculate_achievement_progress(user_uuid UUID)
RETURNS void AS $$
DECLARE
    user_analytics_record RECORD;
    achievement_record RECORD;
    current_progress INTEGER;
    newly_completed BOOLEAN;
    points_balance INTEGER;
BEGIN
    -- Get user analytics
    SELECT * INTO user_analytics_record
    FROM user_analytics
    WHERE user_id = user_uuid;
    
    -- If no analytics record, exit early
    IF user_analytics_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Loop through all achievements for this user
    FOR achievement_record IN 
        SELECT ua.*, ad.name as achievement_name, ad.points_reward, ad.category, ad.target
        FROM user_achievements ua
        JOIN achievement_definitions ad ON ua.achievement_id = ad.id
        WHERE ua.user_id = user_uuid
    LOOP
        current_progress := 0;
        newly_completed := FALSE;
        
        -- Calculate progress based on category
        CASE achievement_record.category
            WHEN 'milestone' THEN
                current_progress := COALESCE(user_analytics_record.total_checkins, 0);
            WHEN 'streak' THEN
                current_progress := COALESCE(user_analytics_record.current_streak, 0);
            WHEN 'wellness' THEN
                current_progress := COALESCE(user_analytics_record.completedantitodos, 0);
            WHEN 'plant' THEN
                -- For plant achievements, check different metrics
                IF achievement_record.achievement_id LIKE '%level%' THEN
                    -- Get max plant level from user_plants
                    SELECT COALESCE(MAX(growth_level), 0) INTO current_progress
                    FROM user_plants
                    WHERE user_id = user_uuid;
                ELSE
                    -- Count of plants owned/created
                    SELECT COUNT(*) INTO current_progress
                    FROM user_plants
                    WHERE user_id = user_uuid;
                END IF;
            WHEN 'timing' THEN
                -- For timing achievements, use streak or check-ins
                IF achievement_record.achievement_id LIKE '%daily%' OR achievement_record.achievement_id LIKE '%weekly%' THEN
                    current_progress := COALESCE(user_analytics_record.current_streak, 0);
                ELSE
                    current_progress := COALESCE(user_analytics_record.total_checkins, 0);
                END IF;
            ELSE
                current_progress := 0;
        END CASE;
        
        -- Check if this achievement was just completed
        IF current_progress >= achievement_record.target AND NOT achievement_record.is_completed THEN
            newly_completed := TRUE;
        END IF;
        
        -- Update the achievement record
        UPDATE user_achievements
        SET 
            progress = LEAST(current_progress, achievement_record.target),
            is_completed = (current_progress >= achievement_record.target),
            completed_at = CASE 
                WHEN newly_completed THEN NOW()
                ELSE completed_at
            END,
            points_earned = CASE 
                WHEN (current_progress >= achievement_record.target) THEN achievement_record.points_reward
                ELSE 0
            END,
            updated_at = NOW()
        WHERE id = achievement_record.id;
        
        -- If newly completed, award points
        IF newly_completed THEN
            -- Ensure user_points record exists
            INSERT INTO user_points (user_id, total_earned, total_spent)
            VALUES (user_uuid, 0, 0)
            ON CONFLICT (user_id) DO NOTHING;
            
            -- Get current balance
            SELECT COALESCE(total_earned, 0) - COALESCE(total_spent, 0) INTO points_balance
            FROM user_points WHERE user_id = user_uuid;
            
            -- Insert point transaction
            INSERT INTO point_transactions (user_id, transaction_type, points, source_type, source_id, description, balance_after)
            VALUES (
                user_uuid,
                'earned',
                achievement_record.points_reward,
                'achievement',
                achievement_record.id,
                'Achievement unlocked: ' || achievement_record.achievement_name,
                points_balance + achievement_record.points_reward
            );
            
            -- Update user_points
            UPDATE user_points 
            SET 
                total_earned = total_earned + achievement_record.points_reward,
                updated_at = NOW()
            WHERE user_id = user_uuid;
            
            -- Update users table points balance
            UPDATE users SET 
                points = (SELECT COALESCE(total_earned, 0) - COALESCE(total_spent, 0) FROM user_points WHERE user_id = user_uuid)
            WHERE id = user_uuid;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to sync points between tables
CREATE OR REPLACE FUNCTION sync_user_points(user_uuid UUID)
RETURNS void AS $$
DECLARE
    calculated_points INTEGER;
BEGIN
    -- Ensure user_points record exists
    INSERT INTO user_points (user_id, total_earned, total_spent)
    VALUES (user_uuid, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Calculate points from user_points table
    SELECT COALESCE(total_earned, 0) - COALESCE(total_spent, 0)
    INTO calculated_points
    FROM user_points
    WHERE user_id = user_uuid;
    
    -- Update users table
    UPDATE users 
    SET points = COALESCE(calculated_points, 0)
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to initialize achievements for a user
CREATE OR REPLACE FUNCTION initialize_user_achievements(user_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Insert missing achievements for the user
    INSERT INTO user_achievements (user_id, achievement_id, progress, target, is_completed, points_earned)
    SELECT 
        user_uuid,
        ad.id,
        0,
        ad.target,
        false,
        0
    FROM achievement_definitions ad
    WHERE ad.id NOT IN (
        SELECT achievement_id 
        FROM user_achievements 
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Initialize everything for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Process each user
    FOR user_record IN SELECT id FROM users LOOP
        -- Initialize achievements
        PERFORM initialize_user_achievements(user_record.id);
        
        -- Sync points
        PERFORM sync_user_points(user_record.id);
        
        -- Calculate current achievement progress
        PERFORM calculate_achievement_progress(user_record.id);
    END LOOP;
END $$;

-- 7. Create a safe view for debugging (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.views WHERE table_name = 'user_points_debug') THEN
        EXECUTE 'CREATE VIEW user_points_debug AS
        SELECT 
            u.id as user_id,
            u.username,
            u.points as current_points,
            COALESCE(up.total_earned, 0) as total_earned,
            COALESCE(up.total_spent, 0) as total_spent,
            COALESCE(up.total_earned, 0) - COALESCE(up.total_spent, 0) as calculated_points,
            CASE 
                WHEN u.points = (COALESCE(up.total_earned, 0) - COALESCE(up.total_spent, 0)) THEN ''Synced''
                ELSE ''Out of Sync''
            END as sync_status
        FROM users u
        LEFT JOIN user_points up ON u.id = up.user_id';
    END IF;
END $$;

-- 8. Optional: Create trigger for automatic achievement updates (be careful with existing triggers)
DO $$
BEGIN
    -- Check if trigger already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_achievements_after_checkin'
    ) THEN
        -- Create the trigger function
        CREATE OR REPLACE FUNCTION trigger_update_achievements_after_checkin()
        RETURNS TRIGGER AS $trigger$
        BEGIN
            -- Update achievement progress after checkin
            PERFORM calculate_achievement_progress(NEW.user_id);
            RETURN NEW;
        END;
        $trigger$ LANGUAGE plpgsql;
        
        -- Create the trigger
        CREATE TRIGGER update_achievements_after_checkin
            AFTER INSERT ON checkins
            FOR EACH ROW
            EXECUTE FUNCTION trigger_update_achievements_after_checkin();
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Achievement and points system setup completed successfully!';
    RAISE NOTICE 'You can now test with: SELECT * FROM user_points_debug;';
END $$;
