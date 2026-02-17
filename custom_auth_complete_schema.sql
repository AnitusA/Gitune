-- ==========================================
-- MIGRATION: CUSTOM AUTH COMPLETE SCHEMA
-- ==========================================
-- Run this in your Supabase SQL Editor
-- WARNING: This drops and recreates tables!
-- Any existing data in these tables will be lost.

-- ==========================================
-- STEP 1: DROP OLD TABLES (order matters - children first)
-- ==========================================
DROP TABLE IF EXISTS public.saved_videos CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.custom_auth_users CASCADE;

-- Drop old trigger/function if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ==========================================
-- STEP 2: CREATE TABLES
-- ==========================================

-- 1. CUSTOM AUTH USERS TABLE
CREATE TABLE public.custom_auth_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USER SETTINGS & TOKENS
CREATE TABLE public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.custom_auth_users(id) ON DELETE CASCADE NOT NULL,
    github_token TEXT,
    github_username TEXT,
    duolingo_username TEXT,
    youtube_api_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- 3. TASKS
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.custom_auth_users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SAVED VIDEOS
CREATE TABLE public.saved_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.custom_auth_users(id) ON DELETE CASCADE NOT NULL,
    video_id TEXT NOT NULL,
    title TEXT,
    watched BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- STEP 3: INDEXES
-- ==========================================
CREATE INDEX idx_custom_auth_users_email ON public.custom_auth_users(email);
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_saved_videos_user_id ON public.saved_videos(user_id);

-- ==========================================
-- STEP 4: ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.custom_auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;

-- Custom Auth Users
CREATE POLICY "Allow public read for auth" ON public.custom_auth_users
    FOR SELECT USING (true);
CREATE POLICY "Allow public insert for auth" ON public.custom_auth_users
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for auth" ON public.custom_auth_users
    FOR UPDATE USING (true);

-- User Settings
CREATE POLICY "Allow anon select user_settings" ON public.user_settings
    FOR SELECT USING (true);
CREATE POLICY "Allow anon insert user_settings" ON public.user_settings
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update user_settings" ON public.user_settings
    FOR UPDATE USING (true);

-- Tasks
CREATE POLICY "Allow anon select tasks" ON public.tasks
    FOR SELECT USING (true);
CREATE POLICY "Allow anon insert tasks" ON public.tasks
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update tasks" ON public.tasks
    FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete tasks" ON public.tasks
    FOR DELETE USING (true);

-- Saved Videos
CREATE POLICY "Allow anon select videos" ON public.saved_videos
    FOR SELECT USING (true);
CREATE POLICY "Allow anon insert videos" ON public.saved_videos
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update videos" ON public.saved_videos
    FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete videos" ON public.saved_videos
    FOR DELETE USING (true);
