import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / '.env')
load_dotenv(BASE_DIR / '.env')

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'meresumax_super_secret_liquid_glass_key_2026')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f"sqlite:///{BASE_DIR / 'meresumax_dev.db'}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    REPORTS_FOLDER = BASE_DIR / 'reports'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    
    # AI Credentials
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
