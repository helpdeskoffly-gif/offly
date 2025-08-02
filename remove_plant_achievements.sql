-- SQL script to remove plant-related achievements from the database
-- Run this in your Supabase SQL editor to clean up plant achievements
-- NOTE: This ONLY removes achievements, NOT the plant garden functionality

-- 1. Remove plant achievements from user_achievements table
DELETE FROM user_achievements 
WHERE achievement_id IN (
    'first_plant', 
    'plant_level_2', 
    'plant_level_3', 
    'plant_level_4', 
    'plant_complete'
);

-- 2. Remove plant achievements from achievement_definitions table
DELETE FROM achievement_definitions 
WHERE id IN (
    'first_plant', 
    'plant_level_2', 
    'plant_level_3', 
    'plant_level_4', 
    'plant_complete'
);

-- 3. Remove plant-related point transactions from achievements only (keeps plant functionality points)
DELETE FROM point_transactions 
WHERE source_type = 'achievement' 
AND description LIKE '%Plant Parent%' 
OR description LIKE '%Growing Green%' 
OR description LIKE '%Garden Guru%' 
OR description LIKE '%Master Gardener%' 
OR description LIKE '%Harvest Master%';

-- 4. Check remaining achievements to verify plant achievements are removed
SELECT id, name, category FROM achievement_definitions ORDER BY category, id;
