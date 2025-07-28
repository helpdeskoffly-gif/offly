-- Add points_reward column to achievement_definitions table
ALTER TABLE public.achievement_definitions 
ADD COLUMN IF NOT EXISTS points_reward integer DEFAULT 10;

-- Populate achievement definitions based on the ACHIEVEMENT_DEFINITIONS in database.js
INSERT INTO public.achievement_definitions (achievement_id, achievement_name, achievement_description, achievement_icon, achievement_category, target, points_reward) 
VALUES 
  ('first_checkin', 'First Steps', 'Complete your first mood check-in', '🎯', 'milestone', 1, 10),
  ('streak_3', 'Getting Started', 'Maintain a 3-day check-in streak', '🔥', 'streak', 3, 15),
  ('streak_7', 'Weekly Warrior', 'Maintain a 7-day check-in streak', '⚡', 'streak', 7, 25),
  ('streak_30', 'Monthly Master', 'Maintain a 30-day check-in streak', '👑', 'streak', 30, 50),
  ('checkins_10', 'Dedicated Tracker', 'Complete 10 total check-ins', '📊', 'milestone', 10, 20),
  ('checkins_50', 'Mood Expert', 'Complete 50 total check-ins', '🎓', 'milestone', 50, 40),
  ('checkins_100', 'Centurion', 'Complete 100 total check-ins', '💯', 'milestone', 100, 75),
  ('first_antitodo', 'Mindful Explorer', 'Complete your first wellness activity', '🌸', 'wellness', 1, 15),
  ('antitodo_5', 'Wellness Enthusiast', 'Complete 5 wellness activities', '🌺', 'wellness', 5, 25),
  ('antitodo_15', 'Mindfulness Master', 'Complete 15 wellness activities', '🧘‍♀️', 'wellness', 15, 40),
  ('antitodo_30', 'Zen Warrior', 'Complete 30 wellness activities', '🏆', 'wellness', 30, 60),
  ('wellness_week', 'Weekly Wellness', 'Complete 3 activities in one week', '📅', 'wellness', 3, 20)
ON CONFLICT (achievement_id) DO UPDATE SET
  achievement_name = EXCLUDED.achievement_name,
  achievement_description = EXCLUDED.achievement_description,
  achievement_icon = EXCLUDED.achievement_icon,
  achievement_category = EXCLUDED.achievement_category,
  target = EXCLUDED.target,
  points_reward = EXCLUDED.points_reward; 