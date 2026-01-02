from app.core.extension import supabase_client
import json

def check_eligibility():
    try:
        # Get latest completed test
        test_res = supabase_client.table("candidate_tests").select("*").eq("status", "completed").order("completed_at", desc=True).limit(1).execute()
        if test_res.data:
            test = test_res.data[0]
            print(f"Latest Test: ID={test['id']}, Score={test['score_percentage']}, Passed={test['passed']}, Language={test['language']}")
            
            # Get candidate profile
            prof_res = supabase_client.table("profiles").select("*").eq("id", test['candidate_id']).single().execute()
            if prof_res.data:
                prof = prof_res.data
                print(f"Profile: ID={prof['id']}, Eligible={prof.get('interview_eligible')}, Status={prof.get('test_status')}")
            else:
                print("Profile not found.")
        else:
            print("No completed tests found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_eligibility()
