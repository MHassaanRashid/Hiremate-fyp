"""
Run this script to add the interviewer_email column to the interviews table
"""
from app.core.extension import supabase_client

def add_interviewer_email_column():
    """Add interviewer_email column to interviews table if it doesn't exist"""
    
    sql = """
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
    """
    
    try:
        # Execute the SQL using Supabase RPC or direct SQL execution
        # Note: Supabase Python client doesn't support direct SQL execution
        # You'll need to run this SQL in your Supabase SQL editor or use psycopg2
        
        print("⚠️  Please run the following SQL in your Supabase SQL Editor:")
        print("-" * 80)
        print(sql)
        print("-" * 80)
        print("\nOr run the SQL file: backend/sql/add_interviewer_email_column.sql")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_interviewer_email_column()
