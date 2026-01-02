from app.core.extension import supabase_client
import json

try:
    res = supabase_client.table("candidate_tests").select("*").limit(5).execute()
    print("RECORDS FOUND:")
    print(json.dumps(res.data, indent=2, default=str))
except Exception as e:
    print(f"ERROR: {e}")
