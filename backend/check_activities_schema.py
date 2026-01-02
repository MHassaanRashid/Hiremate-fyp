import httpx
import os
from dotenv import load_dotenv

load_dotenv()

def get_activities_schema():
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        
        full_url = f"{url}/rest/v1/"
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}"
        }
        res = httpx.get(full_url, headers=headers)
        spec = res.json()
        
        table_def = spec.get('definitions', {}).get('activities', {})
        if not table_def:
            table_def = spec.get('components', {}).get('schemas', {}).get('activities', {})
            
        columns = table_def.get('properties', {}).keys()
        
        if columns:
            print(f"Columns in 'activities': {list(columns)}")
        else:
            print("Could not find 'activities' columns in spec.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_activities_schema()
