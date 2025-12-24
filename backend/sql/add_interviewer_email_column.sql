-- Add interviewer_email column to interviews table if it doesn't exist
-- This allows filtering interviews by interviewer email

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'interviews' 
        AND column_name = 'interviewer_email'
    ) THEN
        ALTER TABLE interviews 
        ADD COLUMN interviewer_email VARCHAR(255);
        
        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_email 
        ON interviews(interviewer_email);
        
        RAISE NOTICE 'Column interviewer_email added to interviews table';
    ELSE
        RAISE NOTICE 'Column interviewer_email already exists';
    END IF;
END $$;
