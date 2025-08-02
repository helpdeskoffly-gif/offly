-- Fix for Achievements and Points System
-- Run this in your Supabase SQL editor

-- 1. Ensure achievement_definitions table has all necessary achievements
INSERT INTO achievement_definitions (id, name, description, points_reward, category, target, icon) VALUES
  ('first_checkin', 'First Steps', 'Complete your first daily check-in', 10, 'milestone', 1, 'CheckCircle'),
  ('checkins_5', 'Getting Started', 'Complete 5 daily check-ins', 25, 'milestone', 5, 'Target'),
  ('checkins_10', 'Dedicated Tracker', 'Complete 10 daily check-ins', 50, 'milestone', 10, 'Trophy'),
  ('checkins_25', 'Consistency Builder', 'Complete 25 daily check-ins', 100, 'milestone', 25, 'Award'),
  ('checkins_50', 'Mood Expert', 'Complete 50 daily check-ins', 200, 'milestone', 50, 'Star'),
  ('checkins_100', 'Centurion', 'Complete 100 daily check-ins', 500, 'milestone', 100, 'Crown'),
  
  -- Streak achievements
  ('streak_3', 'Getting Started', 'Maintain a 3-day check-in streak', 15, 'streak', 3, 'Flame'),
  ('streak_7', 'Weekly Warrior', 'Maintain a 7-day check-in streak', 50, 'streak', 7, 'Flame'),
  ('streak_14', 'Fortnight Fighter', 'Maintain a 14-day check-in streak', 100, 'streak', 14, 'Zap'),
  ('streak_30', 'Monthly Master', 'Maintain a 30-day check-in streak', 250, 'streak', 30, 'Bolt'),
  ('streak_100', 'Streak Legend', 'Maintain a 100-day check-in streak', 1000, 'streak', 100, 'Bolt'),
  
  -- Anti-todo/Wellness achievements
  ('first_antitodo', 'Mindful Explorer', 'Complete your first anti-todo item', 10, 'wellness', 1, 'Heart'),
  ('antitodo_5', 'Wellness Enthusiast', 'Complete 5 anti-todo items', 25, 'wellness', 5, 'HeartHandshake'),
  ('antitodo_15', 'Mindfulness Master', 'Complete 15 anti-todo items', 75, 'wellness', 15, 'Infinity'),
  ('antitodo_30', 'Zen Warrior', 'Complete 30 anti-todo items', 150, 'wellness', 30, 'Compass'),
  
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

-- 2. Create or update the calculate_achievement_progress function
DROP FUNCTION IF EXISTS calculate_achievement_progress(uuid);

CREATE OR REPLACE FUNCTION calculate_achievement_progress(user_uuid UUID)
RETURNS void AS $$
DECLARE
    user_analytics_record RECORD;
    achievement_record RECORD;
    current_progress INTEGER;
    newly_completed BOOLEAN;
BEGIN
    -- Get user analytics
    SELECT * INTO user_analytics_record
    FROM user_analytics
    WHERE user_id = user_uuid;
    
    -- If no analytics record, exit
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
            WHEN 'timing' THEN
                -- For timing achievements, use appropriate metric
                IF achievement_record.achievement_id LIKE '%daily%' OR achievement_record.achievement_id LIKE '%weekly%' THEN
                    current_progress := COALESCE(user_analytics_record.current_streak, 0);
                ELSE
                    current_progress := COALESCE(user_analytics_record.total_checkins, 0);
                END IF;
            ELSE
                current_progress := 0;
        END CASE;
        
        -- Check if newly completed
        IF current_progress >= achievement_record.target AND NOT achievement_record.is_completed THEN
            newly_completed := TRUE;
        END IF;
        
        -- Update the achievement
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
            -- Insert point transaction
            INSERT INTO point_transactions (user_id, transaction_type, points, source_type, source_id, description, balance_after)
            VALUES (
                user_uuid,
                'earned',
                achievement_record.points_reward,
                'achievement',
                achievement_record.id,
                'Achievement unlocked: ' || achievement_record.achievement_name,
                -- Calculate new balance
                (SELECT COALESCE(total_earned, 0) - COALESCE(total_spent, 0) + achievement_record.points_reward
                 FROM user_points WHERE user_id = user_uuid)
            );
            
            -- Update user_points
            INSERT INTO user_points (user_id, total_earned, total_spent)
            VALUES (user_uuid, achievement_record.points_reward, 0)
            ON CONFLICT (user_id) DO UPDATE SET
                total_earned = user_points.total_earned + achievement_record.points_reward,
                updated_at = NOW();
                
            -- Update users table points balance
            UPDATE users SET 
                points = (SELECT COALESCE(total_earned, 0) - COALESCE(total_spent, 0) FROM user_points WHERE user_id = user_uuid)
            WHERE id = user_uuid;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger to automatically update achievement progress after checkins
-- Drop existing trigger first, then function
DROP TRIGGER IF EXISTS update_achievements_after_checkin ON checkins;
DROP FUNCTION IF EXISTS trigger_update_achievements_after_checkin();

CREATE OR REPLACE FUNCTION trigger_update_achievements_after_checkin()
RETURNS TRIGGER AS $$
BEGIN
    -- Just update achievement progress (analytics should already be handled by existing triggers)
    PERFORM calculate_achievement_progress(NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER update_achievements_after_checkin
    AFTER INSERT ON checkins
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_achievements_after_checkin();

-- 4. Function to sync points between user_points and users tables
DROP FUNCTION IF EXISTS sync_user_points(uuid);

CREATE OR REPLACE FUNCTION sync_user_points(user_uuid UUID)
RETURNS void AS $$
DECLARE
    calculated_points INTEGER;
BEGIN
    -- Calculate points from user_points table
    SELECT COALESCE(total_earned, 0) - COALESCE(total_spent, 0)
    INTO calculated_points
    FROM user_points
    WHERE user_id = user_uuid;
    
    -- If no points record exists, create one
    IF calculated_points IS NULL THEN
        INSERT INTO user_points (user_id, total_earned, total_spent)
        VALUES (user_uuid, 0, 0);
        calculated_points := 0;
    END IF;
    
    -- Update users table
    UPDATE users 
    SET points = calculated_points
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 5. Update all existing users' points
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM users LOOP
        PERFORM sync_user_points(user_record.id);
    END LOOP;
END $$;

-- 6. Create a view for easy points checking (drop first to avoid conflicts)
DROP VIEW IF EXISTS user_points_summary CASCADE;

CREATE VIEW user_points_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.points as current_points,
    COALESCE(up.total_earned, 0) as total_earned,
    COALESCE(up.total_spent, 0) as total_spent,
    COALESCE(up.total_earned, 0) - COALESCE(up.total_spent, 0) as calculated_points
FROM users u
LEFT JOIN user_points up ON u.id = up.user_id;

-- 7. Function to ensure user has all achievements initialized
DROP FUNCTION IF EXISTS initialize_user_achievements(uuid);

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

-- 8. Initialize achievements for all existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM users LOOP
        PERFORM initialize_user_achievements(user_record.id);
        PERFORM calculate_achievement_progress(user_record.id);
    END LOOP;
END $$;
