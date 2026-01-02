from app.core.extension import supabase_client

def find_passed_tests():
    try:
        res = supabase_client.table("candidate_tests").select("*").eq("passed", True).execute()
        if res.data:
            for t in res.data:
                print(f"Passed Test: User={t['candidate_id']}, Lang={t['language']}, Score={t['score_percentage']}")
        else:
            print("No passed tests found in DB.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_passed_tests()
