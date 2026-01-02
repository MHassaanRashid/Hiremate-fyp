from app.core.extension import supabase_client
import traceback
import uuid

def migrate():
    try:
        # 1. Try a dummy update to check for column existence
        print("Checking for 'last_test_language' column...")
        try:
            # We use a non-existent ID to avoid actually changing anything if it exists
            supabase_client.table("profiles").update({"last_test_language": "test"}).eq("id", str(uuid.uuid4())).execute()
            print("Column 'last_test_language' already exists.")
        except Exception as e:
            if "column \"last_test_language\" of relation \"profiles\" does not exist" in str(e):
                print("Column 'last_test_language' is MISSING.")
                print("ACTION REQUIRED: Please run this SQL in your Supabase SQL Console:")
                print("ALTER TABLE profiles ADD COLUMN last_test_language VARCHAR(50);")
            else:
                print(f"Unexpected error: {e}")

        # 2. Check if we can fix the data for the current user
        # Hassaan Rashid: bbaee115-5105-46ac-8cbf-e61cd51a25af
        user_id = "bbaee115-5105-46ac-8cbf-e61cd51a25af"
        print(f"\nChecking candidate {user_id}...")
        
        # See if they have any passed tests
        passed_res = supabase_client.table("candidate_tests").select("*").eq("candidate_id", user_id).eq("passed", True).execute()
        if passed_res.data:
            print(f"Candidate has {len(passed_res.data)} passed test(s). Setting eligible = True.")
            update_data = {
                "interview_eligible": True,
                "test_status": "passed"
            }
            # Only add last_test_language if it exists (we'll check via another try-except or just skip it if we know it's missing)
            supabase_client.table("profiles").update(update_data).eq("id", user_id).execute()
            print("Profile updated successfully.")
        else:
            print("No passed tests found for this candidate.")

    except Exception as e:
        print(f"Migration error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    migrate()
