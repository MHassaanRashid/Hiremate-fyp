-- Migration: Fix Interviews Table Schema
-- Description: Add missing columns required for live technical interviews
-- Date: 2026-01-03

ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS interviewer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS interview_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS meeting_id VARCHAR(255);

-- Update existing records if any (optional, but good for consistency)
UPDATE interviews 
SET 
    interview_type = 'Live Technical Interview'
WHERE interview_type IS NULL;

RAISE NOTICE 'Interviews table schema updated successfully';
