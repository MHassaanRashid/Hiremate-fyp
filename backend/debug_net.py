import os
from dotenv import load_dotenv
import asyncio
import httpx
import sys

# Force reload from .env
load_dotenv(override=True)

print("--- Checking Environment ---")
url = os.getenv("SUPABASE_URL")
print(f"SUPABASE_URL from env: '{url}'")
print(f"SUPABASE_URL repr: {repr(url)}")

print("\n--- Checking App Configuration ---")
try:
    # Add key paths to sys.path to mimic app structure
    sys.path.append(os.getcwd())
    from app.core.extension import supabase_client
    print(f"Supabase Client Auth URL: '{supabase_client.auth_url}'")
    print(f"Supabase Client REST URL: '{supabase_client.rest_url}'")
except Exception as e:
    print(f"❌ Failed to import supabase_client: {e}")

print("\n--- Testing Async Connection (HTTPX) ---")
async def test_connect():
    try:
        async with httpx.AsyncClient() as client:
            print(f"Connecting to {url}...")
            resp = await client.get(url, timeout=5)
            print(f"✅ Async HTTP Success: Status {resp.status_code}")
    except Exception as e:
        print(f"❌ Async HTTP Failed: {e}")

asyncio.run(test_connect())
