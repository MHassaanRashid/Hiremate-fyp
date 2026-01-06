from app.core.extension import supabase_client

def verify():
    user_id = "bbaee115-5105-46ac-8cbf-e61cd51a25af"
    res = supabase_client.table("profiles").select("id, interview_eligible, test_status").eq("id", user_id).single().execute()
    if res.data:
        print(f"User {user_id} verification:")
        print(f" - interview_eligible: {res.data.get('interview_eligible')}")
        print(f" - test_status: {res.data.get('test_status')}")
    else:
        print(f"User {user_id} not found in profiles.")

if __name__ == "__main__":
    verify()
