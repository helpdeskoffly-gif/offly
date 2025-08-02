-- Comprehensive fix for all icon issues
-- Run this in your Supabase SQL editor to fix all icon references

-- Fix Fire -> Flame
UPDATE achievement_definitions 
SET icon = 'Flame' 
WHERE icon = 'Fire';

-- Fix Lightning -> Bolt  
UPDATE achievement_definitions 
SET icon = 'Bolt' 
WHERE icon = 'Lightning';

-- Verify all icons are using valid Lucide React icon names
SELECT id, name, icon 
FROM achievement_definitions 
ORDER BY category, target;
