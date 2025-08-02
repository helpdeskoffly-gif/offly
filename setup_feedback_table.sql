-- Feedback System Setup for Supabase
-- Run this in your Supabase SQL editor to enable database-based feedback storage

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  user_email text,
  user_name text,
  feedback_type text DEFAULT 'general',
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own feedback
CREATE POLICY "Users can insert feedback" ON feedback
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  auth.uid() IS NULL  -- Allow anonymous feedback
);

-- Policy to allow users to view their own feedback
CREATE POLICY "Users can view their own feedback" ON feedback
FOR SELECT USING (
  auth.uid() = user_id OR
  auth.uid() IS NULL  -- This might need adjustment based on your needs
);

-- Policy for admin users to view all feedback (optional)
-- CREATE POLICY "Admins can view all feedback" ON feedback
-- FOR SELECT USING (
--   EXISTS (
--     SELECT 1 FROM users 
--     WHERE users.id = auth.uid() 
--     AND users.role = 'admin'
--   )
-- );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_updated_at 
BEFORE UPDATE ON feedback 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for feedback analytics
CREATE OR REPLACE VIEW feedback_analytics AS
SELECT 
  feedback_type,
  status,
  COUNT(*) as count,
  DATE_TRUNC('day', created_at) as date
FROM feedback 
GROUP BY feedback_type, status, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Optional: Create a function to automatically email admins about new feedback
-- This would require setting up email triggers or edge functions
CREATE OR REPLACE FUNCTION notify_admin_new_feedback()
RETURNS TRIGGER AS $$
BEGIN
  -- This function could trigger an email notification
  -- For now, it just logs the event
  INSERT INTO system_logs (event, data, created_at)
  VALUES (
    'new_feedback_received',
    jsonb_build_object(
      'feedback_id', NEW.id,
      'user_email', NEW.user_email,
      'feedback_type', NEW.feedback_type
    ),
    timezone('utc'::text, now())
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Optional system logs table for tracking feedback events
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger for new feedback notifications
CREATE TRIGGER feedback_notification_trigger
AFTER INSERT ON feedback
FOR EACH ROW EXECUTE FUNCTION notify_admin_new_feedback();

-- Grant necessary permissions (adjust as needed)
-- GRANT SELECT, INSERT ON feedback TO authenticated;
-- GRANT SELECT, INSERT ON system_logs TO authenticated;

COMMENT ON TABLE feedback IS 'Stores user feedback and support requests';
COMMENT ON COLUMN feedback.metadata IS 'Stores additional data like user_agent, page, etc.';
COMMENT ON COLUMN feedback.status IS 'Tracks the current status of the feedback item';
