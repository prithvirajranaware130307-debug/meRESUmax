from flask import Blueprint, request, jsonify, g
from ..models import db, Job, SavedJob, Analysis
from ..services.job_service import JobService
from ..utils.auth_helper import auth_required

jobs_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

@jobs_bp.route('', methods=['GET'])
def get_jobs():
    query = request.args.get('query', 'software developer')
    location = request.args.get('location', '')
    page = int(request.args.get('page', 1))
    job_type = request.args.get('type', 'all')

    results = JobService.fetch_jobs(query=query, location=location, page=page, job_type=job_type)
    return jsonify(results), 200

@jobs_bp.route('/recommendations', methods=['GET'])
@auth_required
def get_recommendations():
    # Tailored recommendations based on user's target role or latest analysis
    target_role = g.user.target_role or 'Software Developer'
    latest_analysis = Analysis.query.filter_by(user_id=g.user.id).order_by(Analysis.created_at.desc()).first()
    
    if latest_analysis and latest_analysis.target_role:
        target_role = latest_analysis.target_role

    results = JobService.fetch_jobs(query=target_role, location='', page=1)
    
    # Calculate match percentage against user's skills
    user_skills = set()
    if latest_analysis:
        user_skills = set(s.lower() for s in (latest_analysis.matched_skills or []))

    jobs_with_scores = []
    for j in results.get('jobs', []):
        req_skills = j.get('required_skills', [])
        if req_skills and user_skills:
            matched_count = sum(1 for rs in req_skills if rs.lower() in user_skills)
            calc_match = round(min(98.0, max(35.0, (matched_count / len(req_skills)) * 100)), 1)
        else:
            calc_match = 75.0 if latest_analysis else 60.0

        j['computed_match_score'] = calc_match
        jobs_with_scores.append(j)

    results['jobs'] = jobs_with_scores
    return jsonify(results), 200

@jobs_bp.route('/<int:job_id>/save', methods=['POST'])
@auth_required
def save_job(job_id):
    # Check if job exists in db, otherwise seed it
    job = Job.query.get(job_id)
    if not job:
        # Check if client sent job payload
        data = request.get_json() or {}
        job = Job(
            external_id=data.get('external_id', f'ext_{job_id}'),
            title=data.get('title', 'Software Role'),
            company=data.get('company', 'Tech Company'),
            location=data.get('location', 'Remote'),
            description=data.get('description', ''),
            url=data.get('url', '#'),
            is_demo=data.get('is_demo', False)
        )
        job.required_skills = data.get('required_skills', [])
        db.session.add(job)
        db.session.commit()

    existing = SavedJob.query.filter_by(user_id=g.user.id, job_id=job.id).first()
    if not existing:
        saved = SavedJob(user_id=g.user.id, job_id=job.id)
        db.session.add(saved)
        db.session.commit()

    return jsonify({'message': 'Job saved to favorites.'}), 200

@jobs_bp.route('/<int:job_id>/save', methods=['DELETE'])
@auth_required
def unsave_job(job_id):
    saved = SavedJob.query.filter_by(user_id=g.user.id, job_id=job_id).first()
    if saved:
        db.session.delete(saved)
        db.session.commit()
    return jsonify({'message': 'Job removed from saved list.'}), 200

@jobs_bp.route('/saved', methods=['GET'])
@auth_required
def list_saved_jobs():
    saved = SavedJob.query.filter_by(user_id=g.user.id).order_by(SavedJob.saved_at.desc()).all()
    return jsonify({'saved_jobs': [s.to_dict() for s in saved]}), 200
