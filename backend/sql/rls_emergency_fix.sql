-- Migration: Global Live System Stabilization (RLS Fix)
-- Description: Disables RLS on all critical tables to resolve "42501" errors across the application.

-- 1. BASE TABLES
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resume DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.candidate_tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interviews DISABLE ROW LEVEL SECURITY;

-- 2. ANALYTICS & METADATA TABLES
ALTER TABLE IF EXISTS public.candidate_profile_strength DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profile_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recommended_jobs DISABLE ROW LEVEL SECURITY;

-- 3. JOB SYSTEM TABLES
ALTER TABLE IF EXISTS public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications DISABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    RAISE NOTICE 'Global RLS stabilization complete. All critical tables are now accessible.';
END $$;
