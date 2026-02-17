-- One-time cleanup script for duplicate user_settings records
-- Run this in your Supabase SQL Editor

-- First, let's see if there are any duplicate records
SELECT user_id, COUNT(*) as duplicate_count
FROM public.user_settings 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Clean up duplicates, keeping only the most recent record for each user
WITH ranked_settings AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY user_id 
               ORDER BY updated_at DESC, created_at DESC
           ) as rn
    FROM public.user_settings
)
DELETE FROM public.user_settings 
WHERE id IN (
    SELECT id 
    FROM ranked_settings 
    WHERE rn > 1
);

-- Verify cleanup - this should return no rows
SELECT user_id, COUNT(*) as duplicate_count
FROM public.user_settings 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Show remaining records
SELECT user_id, cau.email, us.github_username, us.duolingo_username, us.created_at, us.updated_at
FROM public.user_settings us
LEFT JOIN public.custom_auth_users cau ON us.user_id = cau.id
ORDER BY us.updated_at DESC;