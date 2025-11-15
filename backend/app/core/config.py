import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    
    @classmethod
    def validate(cls):
        if not cls.SUPABASE_URL:
            raise ValueError("SUPABASE_URL is not set in the environment variables")
        if not cls.SUPABASE_SERVICE_KEY:
            raise ValueError("SUPABASE_SERVICE_KEY is not set in the environment variables")
        return True