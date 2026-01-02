import httpx
import os
from dotenv import load_dotenv

load_dotenv()

def get_actual_columns():
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            print("Missing SUPABASE_URL or keys in .env")
            return
            
        full_url = f"{url}/rest/v1/"
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}"
        }
        res = httpx.get(full_url, headers=headers)
        spec = res.json()
        
        # In newer PostgREST/Supabase, definitions might be under 'paths' or 'components/schemas'
        # Let's just check 'definitions' first as it was common
        interviews_table = spec.get('definitions', {}).get('interviews', {})
        if not interviews_table:
            # Try components/schemas (Swagger/OpenAPI 3)
            interviews_table = spec.get('components', {}).get('schemas', {}).get('interviews', {})
            
        columns = interviews_table.get('properties', {}).keys()
        
        if columns:
            print(f"Columns in 'interviews': {list(columns)}")
        else:
            print("Could not find 'interviews' columns in spec.")
            # Print keys in definitions or schemas to debug
            print(f"Available definitions: {list(spec.get('definitions', {}).keys())}")
            print(f"Available components/schemas: {list(spec.get('components', {}).get('schemas', {}).keys())}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_actual_columns()
