import os
from flask import Blueprint, request, jsonify, g, send_file
from ..config import Config
from ..models import db, Resume, Analysis, RoadmapTask
from ..services.scorer import ResumeScorer
from ..services.matcher import JobMatcher
from ..services.openai_service import AIService
from ..services.report_generator import ReportGenerator
from ..utils.auth_helper import auth_required

analysis_bp = Blueprint('analyses', __name__, url_prefix='/api/analyses')

@analysis_bp.route('', methods=['POST'])
@auth_required
def create_analysis():
    data = request.get_json() or {}
    resume_id = data.get('resume_id')
    target_role = data.get('target_role', g.user.target_role or 'Software Developer')
    custom_jd = data.get('job_description', '')

    if not resume_id:
        return jsonify({'error': 'resume_id is required.'}), 400

    resume = Resume.query.filter_by(id=resume_id, user_id=g.user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or unauthorized.'}), 404

    # 1. Deterministic Heuristic Scoring
    parsed = resume.parsed_data
    parsed['text'] = resume.extracted_text
    
    scoring_result = ResumeScorer.calculate_quality_score(parsed, target_role)
    quality_score = scoring_result['overall_score']

    # 2. Job Matching
    matching_result = JobMatcher.match_resume_to_role(parsed, target_role, custom_jd)
    job_match_score = matching_result['match_score']

    # 3. AI Intelligence (OpenAI or deterministic fallback)
    ai_feedback = AIService.generate_resume_intelligence(
        resume_text=resume.extracted_text,
        skills=parsed.get('skills', []),
        target_role=target_role,
        quality_score=quality_score,
        matched_skills=matching_result['matched_skills'],
        missing_skills=matching_result['missing_skills']
    )

    # 4. Save Analysis Record
    analysis = Analysis(
        user_id=g.user.id,
        resume_id=resume.id,
        target_role=target_role,
        quality_score=quality_score,
        job_match_score=job_match_score
    )
    analysis.category_scores = scoring_result['category_scores']
    analysis.strengths = scoring_result['strengths']
    analysis.weaknesses = scoring_result['weaknesses']
    analysis.improvements = scoring_result['improvements']
    analysis.matched_skills = matching_result['matched_skills']
    analysis.missing_skills = matching_result['missing_skills']
    analysis.ai_feedback = ai_feedback

    db.session.add(analysis)
    db.session.commit()

    # 5. Populate Roadmap Tasks
    milestones = ai_feedback.get('roadmap_milestones', [])
    for m in milestones:
        task = RoadmapTask(
            user_id=g.user.id,
            analysis_id=analysis.id,
            title=m.get('title', 'Learning Objective'),
            description=m.get('description', ''),
            priority=m.get('priority', 'medium'),
            category=m.get('category', 'skill')
        )
        db.session.add(task)
    db.session.commit()

    return jsonify({
        'message': 'Analysis generated successfully.',
        'analysis': analysis.to_dict()
    }), 201

@analysis_bp.route('', methods=['GET'])
@auth_required
def list_analyses():
    analyses = Analysis.query.filter_by(user_id=g.user.id).order_by(Analysis.created_at.desc()).all()
    return jsonify({'analyses': [a.to_dict() for a in analyses]}), 200

@analysis_bp.route('/<int:analysis_id>', methods=['GET'])
@auth_required
def get_analysis(analysis_id):
    analysis = Analysis.query.filter_by(id=analysis_id, user_id=g.user.id).first()
    if not analysis:
        return jsonify({'error': 'Analysis not found or unauthorized.'}), 404
    return jsonify({'analysis': analysis.to_dict()}), 200

@analysis_bp.route('/<int:analysis_id>', methods=['DELETE'])
@auth_required
def delete_analysis(analysis_id):
    analysis = Analysis.query.filter_by(id=analysis_id, user_id=g.user.id).first()
    if not analysis:
        return jsonify({'error': 'Analysis not found or unauthorized.'}), 404

    # Remove associated PDF report if existing
    report_file = os.path.join(Config.REPORTS_FOLDER, f"report_analysis_{analysis_id}.pdf")
    if os.path.exists(report_file):
        try:
            os.remove(report_file)
        except Exception:
            pass

    db.session.delete(analysis)
    db.session.commit()
    return jsonify({'message': 'Analysis deleted successfully.'}), 200

@analysis_bp.route('/<int:analysis_id>/report', methods=['GET'])
@auth_required
def download_report(analysis_id):
    analysis = Analysis.query.filter_by(id=analysis_id, user_id=g.user.id).first()
    if not analysis:
        return jsonify({'error': 'Analysis not found or unauthorized.'}), 404

    os.makedirs(Config.REPORTS_FOLDER, exist_ok=True)
    report_path = os.path.join(Config.REPORTS_FOLDER, f"report_analysis_{analysis_id}.pdf")
    
    # Generate report
    ReportGenerator.generate_pdf_report(analysis.to_dict(), report_path)

    return send_file(
        report_path,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"meRESUmax_Report_{analysis.target_role.replace(' ', '_')}_{analysis_id}.pdf"
    )
