from app.core.extension import supabase_client
import json

# Target candidate_id from debug_db.py
candidate_id = "bbaee115-5105-46ac-8cbf-e61cd51a25af"

try:
    print(f"Querying for candidate_id: {candidate_id}")
    tests_res = supabase_client.table("candidate_tests").select("*").eq(
        "candidate_id", candidate_id
    ).eq("status", "completed").order("completed_at", desc=True).execute()
    
    print(f"Results found: {len(tests_res.data or [])}")
    
    tests = [
        {
            'id': t['id'],
            'language': t['language'],
            'score_percentage': float(t.get('score_percentage', 0) or 0),
            'passed': t.get('passed', False),
            'completed_at': t.get('completed_at')
        }
        for t in (tests_res.data or [])
    ]
    print("SUCCESSFUL PARSING:")
    print(json.dumps(tests, indent=2, default=str))
except Exception as e:
    import traceback
    print(f"FAILED: {e}")
    traceback.print_exc()
