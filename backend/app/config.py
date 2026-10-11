import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / '.env')
load_dotenv(BASE_DIR / '.env')

def get_database_uri():
    db_url = os.getenv('DATABASE_URL', f"sqlite:///{BASE_DIR / 'meresumax_dev.db'}")
    # Render and older PostgreSQL providers supply URLs starting with postgres://
    # SQLAlchemy 2.0+ requires postgresql://
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    return db_url

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'meresumax_super_secret_liquid_glass_key_2026')
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    REPORTS_FOLDER = BASE_DIR / 'reports'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    
    # AI Credentials
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    
    # Job Provider Credentials
    ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID', '')
    ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY', '')
    ADZUNA_COUNTRY = os.getenv('ADZUNA_COUNTRY', 'in')
    
    RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY', '')
    JSEARCH_API_HOST = os.getenv('JSEARCH_API_HOST', 'jsearch.p.rapidapi.com')

    # Security
    ALLOWED_EXTENSIONS = {'pdf', 'docx'}
