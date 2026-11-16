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

    return jsonify({
        'status': 'healthy' if db_ok else 'degraded',
        'platform': 'meRESUmax Platform API',
        'database_connected': db_ok,
        'ai_service': {
            'provider': 'Google Gemini' if gemini_configured else 'Deterministic Heuristic Fallback',
            'configured': gemini_configured,
            'model': Config.GEMINI_MODEL if gemini_configured else 'deterministic-heuristic'
        },
        'job_service': {
            'provider': 'JSearch (RapidAPI)' if (Config.RAPIDAPI_KEY and not Config.RAPIDAPI_KEY.startswith('replace_')) else 'Curated Demo Engine',
            'configured': bool(Config.RAPIDAPI_KEY and not Config.RAPIDAPI_KEY.startswith('replace_')),
            'host': Config.JSEARCH_API_HOST
        }
    }), 200
