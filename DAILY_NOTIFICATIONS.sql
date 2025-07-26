-- Daily Notifications System for Wellness App
-- This creates automated daily motivational notifications for users

-- Function to generate daily motivation message based on user progress
CREATE OR REPLACE FUNCTION generate_daily_motivation_message(
    user_id_param UUID,
    username_param TEXT,
    current_streak INTEGER,
    weekly_checkins INTEGER,
    total_checkins INTEGER
) RETURNS TEXT AS $$
DECLARE
    motivation_message TEXT;
    streak_bonus TEXT := '';
    weekly_progress TEXT := '';
BEGIN
    -- Generate streak-based encouragement
    IF current_streak >= 7 THEN
        streak_bonus := ' Your ' || current_streak || '-day streak is amazing! 🔥';
    ELSIF current_streak >= 3 THEN
        streak_bonus := ' You''re on a ' || current_streak || '-day streak! Keep it going! ✨';
    ELSIF current_streak > 0 THEN
        streak_bonus := ' You''re building momentum with ' || current_streak || ' days! 💪';
    END IF;

    -- Generate weekly progress encouragement
    IF weekly_checkins >= 6 THEN
        weekly_progress := ' Almost a perfect week - you''ve got this! 🌟';
    ELSIF weekly_checkins >= 4 THEN
        weekly_progress := ' You''re having a great week with ' || weekly_checkins || ' check-ins! 🎯';
    ELSIF weekly_checkins >= 2 THEN
        weekly_progress := ' Nice progress this week! Keep the momentum! 🚀';
    ELSE
        weekly_progress := ' A new week, a fresh start! Ready to make it count? 🌅';
    END IF;

    -- Combine messages based on different scenarios
    IF current_streak = 0 AND weekly_checkins = 0 THEN
        motivation_message := 'Good morning, ' || username_param || '! 🌟 Today is perfect for a fresh start. Take a moment to check in with yourself and set a positive tone for the day.';
    ELSIF total_checkins = 0 THEN
        motivation_message := 'Welcome to your wellness journey, ' || username_param || '! 🎉 Your first check-in is just a tap away. Let''s make today count!';
    ELSE
        motivation_message := 'Good morning, ' || username_param || '! ☀️' || streak_bonus || weekly_progress || ' How are you feeling today?';
    END IF;

    RETURN motivation_message;
END;
$$ LANGUAGE plpgsql;

-- Function to create daily notifications for all active users
CREATE OR REPLACE FUNCTION create_daily_notifications()
RETURNS INTEGER AS $$
DECLARE
    user_record RECORD;
    notification_count INTEGER := 0;
    today_date DATE := CURRENT_DATE;
    motivation_msg TEXT;
BEGIN
    -- Loop through all users who haven't received a daily notification today
    FOR user_record IN
        SELECT 
            u.id,
            u.username,
            u.full_name,
            COALESCE(ua.current_streak, 0) as current_streak,
            COALESCE(ua.weekly_unique_checkin_days, 0) as weekly_checkins,
            COALESCE(ua.total_checkins, 0) as total_checkins
        FROM users u
        LEFT JOIN user_analytics ua ON u.id = ua.user_id
        WHERE u.id NOT IN (
            -- Exclude users who already got a daily_nudge notification today
            SELECT user_id 
            FROM notifications 
            WHERE type = 'daily_nudge' 
            AND DATE(created_at) = today_date
        )
        AND u.created_at < NOW() - INTERVAL '1 day' -- Only users who joined more than 1 day ago
    LOOP
        -- Generate personalized motivation message
        motivation_msg := generate_daily_motivation_message(
            user_record.id,
            COALESCE(user_record.username, user_record.full_name, 'there'),
            user_record.current_streak,
            user_record.weekly_checkins,
            user_record.total_checkins
        );

        -- Insert the daily notification
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            priority,
            read,
            dismissed,
            created_at,
            expires_at
        ) VALUES (
            user_record.id,
            '🌅 Daily Check-in Reminder',
            motivation_msg,
            'daily_nudge',
            'normal',
            false,
            false,
            NOW(),
            NOW() + INTERVAL '24 hours' -- Expire after 24 hours
        );

        notification_count := notification_count + 1;
    END LOOP;

    RETURN notification_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create weekly progress notifications (Sundays)
CREATE OR REPLACE FUNCTION create_weekly_progress_notifications()
RETURNS INTEGER AS $$
DECLARE
    user_record RECORD;
    notification_count INTEGER := 0;
    weekly_msg TEXT;
BEGIN
    -- Only run on Sundays
    IF EXTRACT(DOW FROM CURRENT_DATE) != 0 THEN
        RETURN 0;
    END IF;

    FOR user_record IN
        SELECT 
            u.id,
            u.username,
            u.full_name,
            COALESCE(ua.weekly_unique_checkin_days, 0) as weekly_checkins,
            COALESCE(ua.current_streak, 0) as current_streak
        FROM users u
        LEFT JOIN user_analytics ua ON u.id = ua.user_id
        WHERE u.created_at < NOW() - INTERVAL '7 days' -- Only users who joined more than a week ago
    LOOP
        -- Generate weekly progress message
        IF user_record.weekly_checkins >= 6 THEN
            weekly_msg := 'Incredible week, ' || COALESCE(user_record.username, user_record.full_name, 'there') || '! 🎉 You checked in ' || user_record.weekly_checkins || ' times. You''re building amazing wellness habits!';
        ELSIF user_record.weekly_checkins >= 4 THEN
            weekly_msg := 'Great week, ' || COALESCE(user_record.username, user_record.full_name, 'there') || '! 💪 ' || user_record.weekly_checkins || ' check-ins show real commitment to your wellness journey.';
        ELSIF user_record.weekly_checkins >= 2 THEN
            weekly_msg := 'Nice progress this week, ' || COALESCE(user_record.username, user_record.full_name, 'there') || '! 🌱 ' || user_record.weekly_checkins || ' check-ins is a solid start. Ready for an even better week?';
        ELSE
            weekly_msg := 'New week, fresh opportunities, ' || COALESCE(user_record.username, user_record.full_name, 'there') || '! 🌟 This week could be your breakthrough week. Let''s make it count!';
        END IF;

        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            priority,
            read,
            dismissed,
            created_at,
            expires_at
        ) VALUES (
            user_record.id,
            '📊 Weekly Progress Report',
            weekly_msg,
            'weekly_insights',
            'normal',
            false,
            false,
            NOW(),
            NOW() + INTERVAL '3 days' -- Expire after 3 days
        );

        notification_count := notification_count + 1;
    END LOOP;

    RETURN notification_count;
END;
$$ LANGUAGE plpgsql;

-- Set up automated triggers using pg_cron (if available)
-- Note: This requires the pg_cron extension to be enabled
-- If pg_cron is not available, you'll need to set up external scheduling

-- Schedule daily notifications at 4:00 AM UTC
-- SELECT cron.schedule('daily-wellness-notifications', '0 4 * * *', 'SELECT create_daily_notifications();');

-- Schedule weekly progress notifications on Sundays at 9:00 AM UTC  
-- SELECT cron.schedule('weekly-progress-notifications', '0 9 * * 0', 'SELECT create_weekly_progress_notifications();');

-- Manual triggers for testing (remove these in production)
-- You can call these manually for testing:
-- SELECT create_daily_notifications();
-- SELECT create_weekly_progress_notifications(); 