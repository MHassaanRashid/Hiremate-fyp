from app.core.extension import supabase_client
import traceback

def check_interviews_columns():
    try:
        # Fetch one record to see available keys
        res = supabase_client.table("interviews").select("*").limit(1).execute()
        if res.data:
            print(f"Columns in 'interviews': {list(res.data[0].keys())}")
        else:
            # Table might be empty, try to get schema via an empty request
            res = supabase_client.table("interviews").select("*").limit(0).execute()
            print("Interviews table is empty. Trying to guess columns from error messages if needed.")
            # We can also try a small insert to see what fails? No, let's just try to fetch 
            # some metadata if possible.
    except Exception as e:
        print(f"Error checking interviews columns: {e}")

if __name__ == "__main__":
    check_interviews_columns()
