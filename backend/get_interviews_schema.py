from app.core.extension import supabase_client
import json

def get_actual_columns():
    try:
        # We can't easily query information_schema via standard PostgREST
        # But we can try to insert an empty dict and see the error message 
        # listing the columns (sometimes) or just try a SELECT * and check a record if one existed.
        # Since it's empty, let's try to RPC if there's one, but probably not.
        
        # Another way: use the 'rest' api to get the OpenAPI spec which lists columns
        import httpx
        from app.core.config import settings
        
        url = f"{settings.SUPABASE_URL}/rest/v1/"
        headers = {
            "apikey": settings.SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}"
        }
        res = httpx.get(url, headers=headers)
        spec = res.json()
        
        interviews_table = spec.get('definitions', {}).get('interviews', {})
        columns = interviews_table.get('properties', {}).keys()
        
        if columns:
            print(f"Columns in 'interviews' (from spec): {list(columns)}")
        else:
            print("Could not find 'interviews' in OpenAPI spec.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_actual_columns()
