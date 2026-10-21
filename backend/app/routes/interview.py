from flask import Blueprint, request, jsonify, g
from ..utils.auth_helper import auth_required, get_current_user
from ..services.interview_service import InterviewService
from ..models import Resume, Analysis

interview_bp = Blueprint('interview', __name__, url_prefix='/api/interview')

@interview_bp.route('/questions', methods=['POST'])
def get_questions():
    """Generates tailored interview questions for role or active resume."""
    data = request.get_json() or {}
    target_role = data.get('target_role', 'Software Developer')
    difficulty = data.get('difficulty', 'Mid-Level')
    skills = data.get('skills', [])
    resume_summary = data.get('resume_summary', '')

    # If user is authenticated and didn't provide skills or summary, try loading latest resume
    user = get_current_user()
    if user and (not skills or not resume_summary):
        latest_analysis = Analysis.query.filter_by(user_id=user.id).order_by(Analysis.created_at.desc()).first()
        if latest_analysis:
            if not skills:
                skills = latest_analysis.matched_skills or []
            if not target_role or target_role == 'Software Developer':
                target_role = latest_analysis.target_role or target_role

    questions = InterviewService.generate_questions(
        target_role=target_role,
        skills=skills,
        resume_summary=resume_summary,
        difficulty=difficulty
    )

    return jsonify({
        'target_role': target_role,
        'difficulty': difficulty,
        'questions': questions
    }), 200

@interview_bp.route('/evaluate', methods=['POST'])
def evaluate_answer():
    """Evaluates candidate answer to an interview question."""
    data = request.get_json() or {}
    question = data.get('question', '').strip()
    category = data.get('category', 'Technical Depth')
    candidate_answer = (data.get('candidate_answer') or data.get('answer') or '').strip()
    target_role = data.get('target_role', 'Software Developer')
    difficulty = data.get('difficulty', 'Mid-Level')

    if not question:
        return jsonify({'error': 'Question is required.'}), 400

    if not candidate_answer:
        return jsonify({'error': 'Candidate answer cannot be empty.'}), 400

    evaluation = InterviewService.evaluate_answer(
        question=question,
        category=category,
        candidate_answer=candidate_answer,
        target_role=target_role,
        difficulty=difficulty
    )

    return jsonify(evaluation), 200
