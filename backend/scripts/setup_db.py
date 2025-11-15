import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client
from instance.config import Config

# Validate configuration
try:
    Config.validate()
except ValueError as e:
    print(f"Configuration error: {e}")
    print("Please check your .env file and ensure all required environment variables are set.")
    sys.exit(1)

supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)

def check_users_table():
    try:
        # Try to select from the table to verify it exists
        response = supabase.table('users').select('*').limit(1).execute()
        print("Users table exists and is accessible")
        return True
    except Exception as e:
        if "relation \"users\" does not exist" in str(e):
            print("Users table does not exist. Please create it manually in Supabase dashboard.")
            print("\nUse the following SQL in the Supabase SQL Editor:")
            print("""
                CREATE TABLE users (
                    id UUID REFERENCES auth.users(id) PRIMARY KEY,
                    email TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );

                ALTER TABLE users ENABLE ROW LEVEL SECURITY;

                CREATE POLICY "Users can view own data" ON users
                    FOR SELECT USING (auth.uid() = id);

                CREATE POLICY "Users can insert own data" ON users
                    FOR INSERT WITH CHECK (auth.uid() = id);

                CREATE POLICY "Users can update own data" ON users
                    FOR UPDATE USING (auth.uid() = id);
            """)
            return False
        else:
            print(f"Error checking users table: {e}")
            return False

if __name__ == "__main__":
    check_users_table()