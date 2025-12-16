from dotenv import load_dotenv
import os
load_dotenv(override=True)
url = os.getenv('SUPABASE_URL')
print('RAW:', url)
print('REPR:', repr(url))
