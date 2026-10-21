import os
import time
import logging
from flask import Blueprint, request, jsonify, g, send_file
from ..config import Config
from ..models import db, Resume, Analysis, RoadmapTask
from ..services.scorer import ResumeScorer
from ..services.matcher import JobMatcher
from ..services.openai_service import AIService
from ..services.report_generator import ReportGenerator
from ..utils.auth_helper import auth_required

logger = logging.getLogger(__name__)

analysis_bp = Blueprint('analyses', __name__, url_prefix='/api/analyses')

@analysis_bp.route('', methods=['POST'])
@auth_required
def create_analysis():
    t_start = time.perf_counter()
    data = request.get_json() or {}
    resume_id = data.get('resume_id')
    target_role = data.get('target_role', g.user.target_role or 'Software Developer')
    custom_jd = data.get('job_description', '')

    if not resume_id:
        return jsonify({'error': 'resume_id is required.'}), 400

    try:
        resume_id_int = int(resume_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid resume_id format. Must be an integer.'}), 400

    resume = Resume.query.filter_by(id=resume_id_int, user_id=g.user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or unauthorized.'}), 404

    try:
        # 1. Deterministic Heuristic Scoring
        t_score_start = time.perf_counter()
        parsed = dict(resume.parsed_data or {})
        parsed['text'] = resume.extracted_text or ''
        
        scoring_result = ResumeScorer.calculate_quality_score(parsed, target_role)
        quality_score = scoring_result['overall_score']
        t_score = time.perf_counter() - t_score_start

        # 2. Job Matching
        t_match_start = time.perf_counter()
        matching_result = JobMatcher.match_resume_to_role(parsed, target_role, custom_jd)
        job_match_score = matching_result['match_score']
        t_match = time.perf_counter() - t_match_start

        # 3. AI Intelligence (Fast provider with strict timeout or immediate deterministic fallback)
        t_ai_start = time.perf_counter()
        try:
            ai_feedback = AIService.generate_resume_intelligence(
                resume_text=resume.extracted_text or '',
                skills=parsed.get('skills', []),
                target_role=target_role,
                quality_score=quality_score,
                matched_skills=matching_result['matched_skills'],
                missing_skills=matching_result['missing_skills']
            )
        except Exception as ai_err:
            logger.warning(f"AI intelligence exception, using deterministic fallback: {ai_err}")
            ai_feedback = AIService._generate_deterministic_fallback(
                skills=parsed.get('skills', []),
                target_role=target_role,
                quality_score=quality_score,
                matched_skills=matching_result['matched_skills'],
                missing_skills=matching_result['missing_skills']
            )
            ai_feedback['provider_status'] = "Deterministic Heuristic Engine (Fallback)"
        t_ai = time.perf_counter() - t_ai_start

        # 4. Save Analysis Record
        t_db_start = time.perf_counter()
        analysis = Analysis(
            user_id=g.user.id,
            resume_id=resume.id,
            target_role=target_role,
            quality_score=quality_score,
            job_match_score=job_match_score
        )
        analysis.category_scores = scoring_result.get('category_scores', {})
        analysis.strengths = scoring_result.get('strengths', [])
        analysis.weaknesses = scoring_result.get('weaknesses', [])
        analysis.improvements = scoring_result.get('improvements', [])
        analysis.matched_skills = matching_result.get('matched_skills', [])
        analysis.missing_skills = matching_result.get('missing_skills', [])
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
        t_db = time.perf_counter() - t_db_start

        t_total = time.perf_counter() - t_start
        logger.info(
            f"[ANALYSIS_TIMING] analysis_id={analysis.id} user_id={g.user.id} role='{target_role}' "
            f"scoring={t_score:.3f}s matching={t_match:.3f}s ai={t_ai:.3f}s db={t_db:.3f}s total={t_total:.3f}s"
        )

        return jsonify({
            'message': 'Analysis generated successfully.',
            'analysis': analysis.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to generate analysis for resume {resume_id}: {e}", exc_info=True)
        return jsonify({'error': f"Failed to complete resume analysis: {str(e)}"}), 500

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
