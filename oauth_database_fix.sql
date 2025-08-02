-- OAuth Database Fix Commands
-- Run these SQL commands in your Supabase SQL editor to fix the authentication issues

-- 1. Check current user count first
SELECT COUNT(*) as current_users FROM public.users;

-- 2. Temporarily disable the user limit trigger that's blocking new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Check for any other potential triggers on the users table
SELECT 
    schemaname, 
    tablename, 
    trigger_name, 
    action_timing, 
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE table_name = 'users' AND table_schema = 'public';

-- 4. Update the trigger function to allow more users (100 instead of 25)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Increased limit from 25 to 100 users
  IF (SELECT count(*) FROM public.users) >= 100 THEN
    RAISE EXCEPTION 'User limit reached. Please join the waitlist.';
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. OPTIONAL: Re-enable the trigger with updated limit (only if you want to keep the limit)
-- Comment out the next 3 lines if you want to completely remove user limits for now
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Check for conflicting RLS policies that might block user creation
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public';

-- 7. If you see conflicting policies, you might need to temporarily disable RLS
-- UNCOMMENT ONLY IF NEEDED:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 8. Test the fix by checking if new users can be created
-- (This will be tested through your OAuth flow)

-- 9. Monitor user creation after applying these fixes
-- You can run this to see recent user registrations:
-- SELECT id, email, created_at 
-- FROM public.users 
-- ORDER BY created_at DESC 
-- LIMIT 10;
