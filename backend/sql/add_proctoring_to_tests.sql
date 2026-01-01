-- Migration: Add Proctoring columns to candidate_tests
-- Description: Add columns to store proctoring logs, proof (base64/URL), termination reason, and preparation metadata.

ALTER TABLE candidate_tests
ADD COLUMN IF NOT EXISTS proctoring_logs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS violation_proof TEXT,
ADD COLUMN IF NOT EXISTS termination_reason TEXT,
ADD COLUMN IF NOT EXISTS fullscreen_exit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS preparation_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS monitoring_ready_at TIMESTAMP;

COMMENT ON COLUMN candidate_tests.proctoring_logs IS 'JSON array of proctoring violations: [{type, time, reason, evidence}]';
COMMENT ON COLUMN candidate_tests.violation_proof IS 'Base64 encoded image or URL of the critical violation that triggered termination';
COMMENT ON COLUMN candidate_tests.termination_reason IS 'Reason for termination if the test was stopped early';
COMMENT ON COLUMN candidate_tests.fullscreen_exit_count IS 'Number of times the user exited fullscreen mode during the test';
COMMENT ON COLUMN candidate_tests.preparation_completed_at IS 'Timestamp when the preparation phase was completed and quiz started';
COMMENT ON COLUMN candidate_tests.monitoring_ready_at IS 'Timestamp when all monitoring systems were initialized and ready';
