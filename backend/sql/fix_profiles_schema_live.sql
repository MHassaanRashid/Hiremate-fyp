-- Migration: Fix Profiles Schema for Live Environment
-- Description: Add all missing columns to the profiles table required by the current backend
-- Problem: PostgREST error PGRST204 (Column not found) during OAuth/Profile flows

-- 1. Core Profile Columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS resume_uploaded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_score DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'candidate',
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Resume / Candidate Specific Columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certificates JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

-- 3. Recruiter / Company Specific Columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_logo TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT;

-- 4. Test / Assessment Status Columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS test_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS interview_eligible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_test_language TEXT,
ADD COLUMN IF NOT EXISTS last_test_date TIMESTAMP WITH TIME ZONE;

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.resume_uploaded IS 'True if the candidate has completed the resume builder';
COMMENT ON COLUMN public.profiles.ai_score IS 'Overall AI-calculated score based on resumes and tests';
COMMENT ON COLUMN public.profiles.test_status IS 'Status of the latest AI quiz attempt';

-- =====================================================
-- STEP 5: Fix Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile (Required for first-time login)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Allow Service Role (Backend) full access
-- Note: Service role usually bypasses RLS, but explicit policy helps in some edge cases
-- or if the user accidentally used the ANON key for the backend.

-- Notify completion
DO $$ 
BEGIN 
    RAISE NOTICE 'Profiles table schema and RLS policies synchronization complete.';
END $$;
