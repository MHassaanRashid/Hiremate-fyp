import os
import logging
from dotenv import load_dotenv
from supabase import create_client

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Force reload to ensure .env takes precedence over system env vars
load_dotenv(override=True)

_raw_url = os.getenv("SUPABASE_URL")
_raw_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

# If env vars not found, attempt to load .env from the backend folder explicitly
if not _raw_url or not _raw_key:
    try:
        from pathlib import Path
        backend_env = str(Path(__file__).resolve().parents[2] / '.env')
        load_dotenv(backend_env, override=True)
        _raw_url = os.getenv("SUPABASE_URL")
        _raw_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        logger.info(f"Loaded .env from {backend_env}")
    except Exception:
        pass

# Defensive: strip whitespace/newlines that sometimes come from malformed .env
SUPABASE_URL = _raw_url.strip() if isinstance(_raw_url, str) else _raw_url
SUPABASE_SERVICE_KEY = _raw_key.strip() if isinstance(_raw_key, str) else _raw_key

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    logger.error("❌ Supabase credentials missing or empty! Check your .env file.")
    raise ValueError("Supabase credentials are missing. Check your .env file.")

logger.info(f"✅ Supabase Client Initialized with URL: {SUPABASE_URL}")
logger.debug(f"SUPABASE_URL repr: {repr(SUPABASE_URL)}")

# Create the client (will raise if URL is invalid)
supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
