from app.core.extension import supabase_client

def check_profiles_schema():
    try:
        res = supabase_client.table("profiles").select("*").limit(1).execute()
        if res.data:
            print(f"Columns in 'profiles': {list(res.data[0].keys())}")
        else:
            print("Profiles table is empty or could not fetch results.")
    except Exception as e:
        print(f"Error checking profiles schema: {e}")

if __name__ == "__main__":
    check_profiles_schema()
