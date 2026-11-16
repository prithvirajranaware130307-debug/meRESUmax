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

    return jsonify({
        'status': 'healthy' if db_ok else 'degraded',
        'platform': 'meRESUmax Platform API',
        'database_connected': db_ok,
        'ai_service': {
            'provider': 'Google Gemini' if (Config.GEMINI_API_KEY and not Config.GEMINI_API_KEY.startswith('replace_')) else ('OpenAI' if (Config.OPENAI_API_KEY and not Config.OPENAI_API_KEY.startswith('replace_')) else 'Deterministic Heuristic Fallback'),
            'configured': bool((Config.GEMINI_API_KEY and not Config.GEMINI_API_KEY.startswith('replace_')) or (Config.OPENAI_API_KEY and not Config.OPENAI_API_KEY.startswith('replace_'))),
            'model': Config.GEMINI_MODEL if Config.GEMINI_API_KEY else Config.OPENAI_MODEL
        },
        'job_service': {
            'provider': 'JSearch (RapidAPI)' if (Config.RAPIDAPI_KEY and not Config.RAPIDAPI_KEY.startswith('replace_')) else 'Curated Demo Engine',
            'configured': bool(Config.RAPIDAPI_KEY and not Config.RAPIDAPI_KEY.startswith('replace_')),
            'host': Config.JSEARCH_API_HOST
        }
    }), 200
