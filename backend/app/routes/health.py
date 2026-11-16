from flask import Blueprint, jsonify
from ..models import db
from ..config import Config

health_bp = Blueprint('health', __name__, url_prefix='/api/health')

@health_bp.route('', methods=['GET'])
@health_bp.route('/', methods=['GET'])
def health():
    db_ok = True
    try:
        db.session.execute(db.text('SELECT 1'))
    except Exception:
        db_ok = False

    gemini_configured = bool(Config.GEMINI_API_KEY and Config.GEMINI_API_KEY.strip() and not Config.GEMINI_API_KEY.startswith('replace_'))
    groq_configured = bool(Config.GROQ_API_KEY and Config.GROQ_API_KEY.strip() and not Config.GROQ_API_KEY.startswith('replace_'))

    if gemini_configured:
        ai_provider = 'Google Gemini'
        ai_model = Config.GEMINI_MODEL or 'gemini-2.5-flash'
    elif groq_configured:
        ai_provider = 'Groq'
        ai_model = Config.GROQ_MODEL or 'qwen/qwen3.8-27b'
    else:
        ai_provider = 'Deterministic Heuristic Fallback'
        ai_model = 'deterministic-heuristic'

    return jsonify({
        'status': 'healthy' if db_ok else 'degraded',
        'platform': 'meRESUmax Platform API',
        'database_connected': db_ok,
        'ai_service': {
            'provider': ai_provider,
            'configured': gemini_configured or groq_configured,
            'model': ai_model,
            'gemini_configured': gemini_configured,
            'groq_configured': groq_configured
        },
        'job_service': {
            'provider': 'JSearch (RapidAPI)' if (Config.RAPIDAPI_KEY and not Config.RAPIDAPI_KEY.startswith('replace_')) else 'Curated Demo Engine',
            'configured': bool(Config.RAPIDAPI_KEY and not Config.RAPIDAPI_KEY.startswith('replace_')),
            'host': Config.JSEARCH_API_HOST
        }
    }), 200
