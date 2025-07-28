-- Add points_reward column to achievements table
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS points_reward integer DEFAULT 10; 