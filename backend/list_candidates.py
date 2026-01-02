from app.core.extension import supabase_client

def list_candidates():
    try:
        res = supabase_client.table("profiles").select("id, full_name, email, interview_eligible, test_status").eq("role", "candidate").execute()
        if res.data:
            print(f"{'Name':<20} | {'Email':<30} | {'Eligible':<10} | {'Status':<10}")
            print("-" * 80)
            for p in res.data:
                print(f"{str(p.get('full_name')):<20} | {str(p.get('email')):<30} | {str(p.get('interview_eligible')):<10} | {str(p.get('test_status')):<10}")
        else:
            print("No candidates found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_candidates()
