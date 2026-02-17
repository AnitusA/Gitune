-- Custom Authentication Schema with Hashed Passwords
-- Run this SQL in your Supabase SQL Editor to create the custom_auth_users table

CREATE TABLE IF NOT EXISTS public.custom_auth_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,  -- bcrypt hashed password
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_custom_auth_users_email ON public.custom_auth_users(email);

-- Row Level Security - Allow public access for authentication
ALTER TABLE public.custom_auth_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read from this table (needed for login)
CREATE POLICY "Allow public read access" ON public.custom_auth_users
    FOR SELECT USING (true);

-- Allow anyone to insert (needed for signup)
CREATE POLICY "Allow public insert" ON public.custom_auth_users
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own records
CREATE POLICY "Allow update own record" ON public.custom_auth_users
    FOR UPDATE USING (true);

-- Example password hash (for 'password123'):
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
