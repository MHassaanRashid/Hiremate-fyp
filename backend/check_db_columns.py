from app.core.extension import supabase_client
import traceback

def check_columns():
    try:
        # Fetch one record to see available keys
        res = supabase_client.table("profiles").select("*").limit(1).execute()
        if res.data:
            print(f"Columns in 'profiles': {list(res.data[0].keys())}")
        else:
            print("No data in 'profiles' table to check columns.")
    except Exception as e:
        print(f"Error checking columns: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    check_columns()
