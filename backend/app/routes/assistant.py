from flask import Blueprint, request, jsonify, g
from ..utils.auth_helper import get_current_user
from ..models import Analysis, Resume
from ..services.openai_service import AIService

assistant_bp = Blueprint('assistant', __name__, url_prefix='/api/assistant')

@assistant_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    message = data.get('message', '').strip()

    if not message:
        return jsonify({'error': 'Message cannot be empty.'}), 400

    # Optional authenticated context
    user = get_current_user()
    target_role = data.get('target_role')
    quality_score = None
    skills = []
    missing_skills = []

    if user:
        if not target_role:
            target_role = user.target_role or 'Software Developer'
        latest_analysis = Analysis.query.filter_by(user_id=user.id).order_by(Analysis.created_at.desc()).first()
        if latest_analysis:
            quality_score = latest_analysis.quality_score
            skills = latest_analysis.matched_skills or []
            missing_skills = latest_analysis.missing_skills or []
            if not data.get('target_role'):
                target_role = latest_analysis.target_role or target_role
    else:
        target_role = target_role or 'Software Developer'

    response_data = AIService.chat_assistant(
        message=message,
        target_role=target_role,
        quality_score=quality_score,
        skills=skills,
        missing_skills=missing_skills
    )

    return jsonify(response_data), 200
