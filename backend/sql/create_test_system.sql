-- Migration: Create Test System Tables
-- Description: Add test-related tables and update profiles for candidate journey
-- Date: 2024-12-21

-- =====================================================
-- STEP 1: Update profiles table with test fields
-- =====================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS test_status VARCHAR(50) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS interview_eligible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_test_date TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN profiles.test_status IS 'Test status: not_started, in_progress, completed, passed, failed';
COMMENT ON COLUMN profiles.interview_eligible IS 'Whether candidate is eligible for interviews (test passed)';
COMMENT ON COLUMN profiles.last_test_date IS 'Timestamp of last completed test';

-- =====================================================
-- STEP 2: Create test_languages configuration table
-- =====================================================

CREATE TABLE IF NOT EXISTS test_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_name VARCHAR(50) NOT NULL UNIQUE,
  language_code VARCHAR(10) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(500),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  difficulty_levels JSONB DEFAULT '["easy", "medium", "hard"]',
  default_duration_minutes INTEGER DEFAULT 15,
  default_question_count INTEGER DEFAULT 10,
  passing_score_percentage DECIMAL(5,2) DEFAULT 80.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE test_languages IS 'Configuration for available programming language tests';

-- =====================================================
-- STEP 3: Create candidate_tests table
-- =====================================================

CREATE TABLE IF NOT EXISTS candidate_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language VARCHAR(50) NOT NULL,
  test_type VARCHAR(50) DEFAULT 'ai_assessment',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 15,
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  total_questions INTEGER DEFAULT 10,
  correct_answers INTEGER DEFAULT 0,
  score_percentage DECIMAL(5,2) DEFAULT 0.00,
  passed BOOLEAN DEFAULT FALSE,
  
  -- AI Evaluation Fields (nullable until AI implemented)
  ai_evaluation_status VARCHAR(50) DEFAULT 'pending',
  ai_code_quality_score DECIMAL(3,2),
  ai_problem_solving_score DECIMAL(3,2),
  ai_efficiency_score DECIMAL(3,2),
  ai_feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_score CHECK (score_percentage >= 0 AND score_percentage <= 100),
  CONSTRAINT valid_ai_scores CHECK (
    ai_code_quality_score IS NULL OR (ai_code_quality_score >= 0 AND ai_code_quality_score <= 10)
  )
);

COMMENT ON TABLE candidate_tests IS 'Test sessions taken by candidates';
COMMENT ON COLUMN candidate_tests.ai_evaluation_status IS 'Status: pending, completed, failed, not_applicable';

-- =====================================================
-- STEP 4: Create test_questions table
-- =====================================================

CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES candidate_tests(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  
  -- For MCQ questions
  options JSONB,
  correct_option INTEGER,
  
  -- For coding questions
  code_template TEXT,
  test_cases JSONB,
  
  -- Metadata
  ai_generated BOOLEAN DEFAULT FALSE,
  difficulty_level VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE test_questions IS 'Questions for each test session';
COMMENT ON COLUMN test_questions.question_type IS 'Type: mcq, coding, debugging';

-- =====================================================
-- STEP 5: Create test_answers table
-- =====================================================

CREATE TABLE IF NOT EXISTS test_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES candidate_tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  
  -- Answer data
  answer_text TEXT,
  selected_option INTEGER,
  code_submission TEXT,
  
  -- Evaluation
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2) DEFAULT 0,
  ai_evaluation JSONB,
  
  -- Timing
  time_spent_seconds INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE test_answers IS 'Candidate answers to test questions';

-- =====================================================
-- STEP 6: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_candidate_tests_candidate ON candidate_tests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_tests_status ON candidate_tests(status);
CREATE INDEX IF NOT EXISTS idx_candidate_tests_language ON candidate_tests(language);
CREATE INDEX IF NOT EXISTS idx_candidate_tests_completed ON candidate_tests(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_number ON test_questions(test_id, question_number);

CREATE INDEX IF NOT EXISTS idx_test_answers_test ON test_answers(test_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_question ON test_answers(question_id);

-- =====================================================
-- STEP 7: Create trigger for interview eligibility
-- =====================================================

CREATE OR REPLACE FUNCTION update_interview_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.passed = TRUE AND (OLD.passed IS NULL OR OLD.passed = FALSE) THEN
    UPDATE profiles
    SET 
      interview_eligible = TRUE,
      test_status = 'passed',
      last_test_date = NEW.completed_at
    WHERE id = NEW.candidate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS test_passed_trigger ON candidate_tests;
CREATE TRIGGER test_passed_trigger
AFTER UPDATE ON candidate_tests
FOR EACH ROW
WHEN (NEW.passed = TRUE AND OLD.passed IS DISTINCT FROM TRUE)
EXECUTE FUNCTION update_interview_eligibility();

COMMENT ON FUNCTION update_interview_eligibility() IS 'Automatically unlock interviews when test is passed';

-- =====================================================
-- STEP 8: Seed test languages
-- =====================================================

INSERT INTO test_languages (language_name, language_code, display_name, description) VALUES
  ('JavaScript', 'js', 'JavaScript', 'Test your JavaScript knowledge and problem-solving skills'),
  ('Python', 'py', 'Python', 'Demonstrate your Python programming expertise'),
  ('Java', 'java', 'Java', 'Showcase your Java development capabilities'),
  ('C++', 'cpp', 'C++', 'Test your C++ proficiency and algorithms'),
  ('Go', 'go', 'Go', 'Evaluate your Go programming skills'),
  ('Rust', 'rust', 'Rust', 'Demonstrate your Rust knowledge'),
  ('TypeScript', 'ts', 'TypeScript', 'Test your TypeScript expertise'),
  ('C#', 'csharp', 'C#', 'Showcase your C# development skills')
ON CONFLICT (language_code) DO NOTHING;

-- =====================================================
-- STEP 9: Verify migration
-- =====================================================

-- Check if tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'candidate_tests') THEN
    RAISE EXCEPTION 'Migration failed: candidate_tests table not created';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'test_questions') THEN
    RAISE EXCEPTION 'Migration failed: test_questions table not created';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'test_answers') THEN
    RAISE EXCEPTION 'Migration failed: test_answers table not created';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'test_languages') THEN
    RAISE EXCEPTION 'Migration failed: test_languages table not created';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully!';
END $$;
