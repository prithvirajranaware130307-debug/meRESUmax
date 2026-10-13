from flask import Blueprint, request, jsonify, g
from ..utils.auth_helper import get_current_user
from ..services.career_tools_service import CareerToolsService
from ..models import Analysis

career_tools_bp = Blueprint('career_tools', __name__, url_prefix='/api/tools')

@career_tools_bp.route('/cover-letter', methods=['POST'])
def generate_cover_letter():
    """Generates an ATS-optimized, persuasive cover letter."""
    data = request.get_json() or {}
    candidate_name = data.get('candidate_name', '').strip()
    target_role = data.get('target_role', '').strip()
    company_name = data.get('company_name', '').strip()
    job_description = data.get('job_description', '').strip()
    resume_summary = data.get('resume_summary', '').strip()
    skills = data.get('skills', [])
    tone = data.get('tone', 'Professional').strip()

    # If user is logged in and fields are missing, auto-populate from profile and latest analysis
    user = get_current_user()
    if user:
        if not candidate_name:
            candidate_name = user.name
        if not target_role:
            target_role = user.target_role or 'Software Developer'
        if not skills or not resume_summary:
            latest_analysis = Analysis.query.filter_by(user_id=user.id).order_by(Analysis.created_at.desc()).first()
            if latest_analysis:
                if not skills:
                    skills = latest_analysis.matched_skills or []
                if not resume_summary and latest_analysis.ai_feedback:
                    resume_summary = latest_analysis.ai_feedback.get('executive_summary', '')

    if not candidate_name:
        candidate_name = "Candidate"
    if not target_role:
        target_role = "Software Developer"

    result = CareerToolsService.generate_cover_letter(
        candidate_name=candidate_name,
        target_role=target_role,
        company_name=company_name,
        job_description=job_description,
        resume_summary=resume_summary,
        skills=skills,
        tone=tone
    )

    return jsonify(result), 200

@career_tools_bp.route('/linkedin', methods=['POST'])
def generate_linkedin():
    """Generates punchy headlines and an optimized About section for LinkedIn."""
    data = request.get_json() or {}
    candidate_name = data.get('candidate_name', '').strip()
    target_role = data.get('target_role', '').strip()
    skills = data.get('skills', [])
    resume_summary = data.get('resume_summary', '').strip()

    user = get_current_user()
    if user:
        if not candidate_name:
            candidate_name = user.name
        if not target_role:
            target_role = user.target_role or 'Software Developer'
        if not skills or not resume_summary:
            latest_analysis = Analysis.query.filter_by(user_id=user.id).order_by(Analysis.created_at.desc()).first()
            if latest_analysis:
                if not skills:
                    skills = latest_analysis.matched_skills or []
                if not resume_summary and latest_analysis.ai_feedback:
                    resume_summary = latest_analysis.ai_feedback.get('executive_summary', '')

    if not candidate_name:
        candidate_name = "Candidate"
    if not target_role:
        target_role = "Software Developer"

    result = CareerToolsService.generate_linkedin(
        candidate_name=candidate_name,
        target_role=target_role,
        skills=skills,
        resume_summary=resume_summary
    )

    return jsonify(result), 200
