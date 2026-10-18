from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, g
from ..models import db, JobApplication, Job
from ..utils.auth_helper import auth_required

applications_bp = Blueprint('applications', __name__, url_prefix='/api/applications')

def parse_iso_datetime(date_str):
    if not date_str:
        return None
    try:
        # Handles 2026-10-18T14:30:00 or 2026-10-18
        if 'T' in date_str:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00')).replace(tzinfo=None)
        return datetime.strptime(date_str, '%Y-%m-%d')
    except Exception:
        return None

@applications_bp.route('', methods=['GET'])
@auth_required
def list_applications():
    status_filter = request.args.get('status', 'all').lower()
    priority_filter = request.args.get('priority', 'all').lower()
    search = request.args.get('search', '').strip().lower()

    query = JobApplication.query.filter_by(user_id=g.user.id)

    if status_filter != 'all':
        query = query.filter_by(status=status_filter)

    if priority_filter != 'all':
        query = query.filter_by(priority=priority_filter)

    all_user_apps = JobApplication.query.filter_by(user_id=g.user.id).all()
    apps = query.order_by(JobApplication.created_at.desc()).all()

    if search:
        apps = [
            a for a in apps 
            if search in a.company.lower() 
            or search in a.role.lower() 
            or search in (a.location or '').lower() 
            or search in (a.notes or '').lower()
        ]

    # Calculate statistics across all user applications
    counts = {
        'total': len(all_user_apps),
        'saved': sum(1 for a in all_user_apps if a.status == 'saved'),
        'applied': sum(1 for a in all_user_apps if a.status == 'applied'),
        'interviewing': sum(1 for a in all_user_apps if a.status == 'interviewing'),
        'offer': sum(1 for a in all_user_apps if a.status == 'offer'),
        'rejected': sum(1 for a in all_user_apps if a.status == 'rejected')
    }

    # Meaningful conversion rate: (Interviewing + Offer) / (Applied + Interviewing + Offer + Rejected)
    actioned_total = counts['applied'] + counts['interviewing'] + counts['offer'] + counts['rejected']
    if actioned_total > 0:
        counts['conversion_rate'] = round(((counts['interviewing'] + counts['offer']) / actioned_total) * 100, 1)
    else:
        counts['conversion_rate'] = 0.0

    # Upcoming interviews within the next 30 days
    now = datetime.utcnow()
    upcoming = [
        a.to_dict() for a in all_user_apps 
        if a.interview_date and a.interview_date >= now
    ]
    upcoming.sort(key=lambda x: x['interview_date'] or '')

    return jsonify({
        'applications': [a.to_dict() for a in apps],
        'stats': counts,
        'upcoming_interviews': upcoming
    }), 200

@applications_bp.route('', methods=['POST'])
@auth_required
def create_application():
    data = request.get_json() or {}

    company = data.get('company', '').strip()
    role = data.get('role', '').strip()

    if not company or not role:
        return jsonify({'error': 'Company name and Role title are required.'}), 400

    job_id = data.get('job_id')
    status = data.get('status', 'saved').lower()
    if status not in {'saved', 'applied', 'interviewing', 'offer', 'rejected'}:
        status = 'saved'

    priority = data.get('priority', 'medium').lower()
    if priority not in {'high', 'medium', 'low'}:
        priority = 'medium'

    applied_date = parse_iso_datetime(data.get('applied_date'))
    if not applied_date and status in {'applied', 'interviewing', 'offer'}:
        applied_date = datetime.utcnow()

    interview_date = parse_iso_datetime(data.get('interview_date'))
    deadline = parse_iso_datetime(data.get('deadline'))

    app_record = JobApplication(
        user_id=g.user.id,
        job_id=job_id,
        company=company,
        role=role,
        location=data.get('location', 'Remote'),
        job_type=data.get('job_type', 'Full-time'),
        status=status,
        priority=priority,
        salary_range=data.get('salary_range', ''),
        url=data.get('url', ''),
        contact_name=data.get('contact_name', ''),
        contact_email=data.get('contact_email', ''),
        notes=data.get('notes', ''),
        next_step=data.get('next_step', ''),
        applied_date=applied_date,
        interview_date=interview_date,
        deadline=deadline
    )

    db.session.add(app_record)
    db.session.commit()

    return jsonify({
        'message': 'Job application tracked successfully.',
        'application': app_record.to_dict()
    }), 201

@applications_bp.route('/<int:app_id>', methods=['GET'])
@auth_required
def get_application(app_id):
    app_record = JobApplication.query.filter_by(id=app_id, user_id=g.user.id).first()
    if not app_record:
        return jsonify({'error': 'Application not found.'}), 404
    return jsonify({'application': app_record.to_dict()}), 200

@applications_bp.route('/<int:app_id>', methods=['PATCH'])
@auth_required
def update_application(app_id):
    app_record = JobApplication.query.filter_by(id=app_id, user_id=g.user.id).first()
    if not app_record:
        return jsonify({'error': 'Application not found.'}), 404

    data = request.get_json() or {}

    if 'company' in data:
        app_record.company = data['company'].strip()
    if 'role' in data:
        app_record.role = data['role'].strip()
    if 'location' in data:
        app_record.location = data['location'].strip()
    if 'job_type' in data:
        app_record.job_type = data['job_type'].strip()
    if 'status' in data:
        new_status = data['status'].lower()
        if new_status in {'saved', 'applied', 'interviewing', 'offer', 'rejected'}:
            if new_status == 'applied' and not app_record.applied_date:
                app_record.applied_date = datetime.utcnow()
            app_record.status = new_status
    if 'priority' in data:
        new_priority = data['priority'].lower()
        if new_priority in {'high', 'medium', 'low'}:
            app_record.priority = new_priority
    if 'salary_range' in data:
        app_record.salary_range = data['salary_range'].strip()
    if 'url' in data:
        app_record.url = data['url'].strip()
    if 'contact_name' in data:
        app_record.contact_name = data['contact_name'].strip()
    if 'contact_email' in data:
        app_record.contact_email = data['contact_email'].strip()
    if 'notes' in data:
        app_record.notes = data['notes']
    if 'next_step' in data:
        app_record.next_step = data['next_step']

    if 'applied_date' in data:
        app_record.applied_date = parse_iso_datetime(data['applied_date'])
    if 'interview_date' in data:
        app_record.interview_date = parse_iso_datetime(data['interview_date'])
    if 'deadline' in data:
        app_record.deadline = parse_iso_datetime(data['deadline'])

    db.session.commit()
    return jsonify({
        'message': 'Application updated successfully.',
        'application': app_record.to_dict()
    }), 200

@applications_bp.route('/<int:app_id>', methods=['DELETE'])
@auth_required
def delete_application(app_id):
    app_record = JobApplication.query.filter_by(id=app_id, user_id=g.user.id).first()
    if not app_record:
        return jsonify({'error': 'Application not found.'}), 404

    db.session.delete(app_record)
    db.session.commit()
    return jsonify({'message': 'Application removed from tracker.'}), 200

@applications_bp.route('/seed-sample', methods=['POST'])
@auth_required
def seed_sample_applications():
    # If user already has applications, avoid overwriting
    existing_count = JobApplication.query.filter_by(user_id=g.user.id).count()
    if existing_count > 0:
        return jsonify({'message': f'Tracker already has {existing_count} applications.', 'seeded': False}), 200

    now = datetime.utcnow()
    samples = [
        JobApplication(
            user_id=g.user.id,
            company='Stripe',
            role='Full Stack Software Engineer',
            location='San Francisco, CA (Remote)',
            job_type='Full-time',
            status='interviewing',
            priority='high',
            salary_range='$145,000 - $175,000',
            url='https://stripe.com/jobs',
            contact_name='Sarah Jenkins',
            contact_email='sarah.recruiting@stripe.com',
            notes='Completed initial recruiter screen. Recruiter emphasized system design and clean REST architecture.',
            next_step='Technical Architecture & Live Coding round with Senior Staff Engineer.',
            applied_date=now - timedelta(days=12),
            interview_date=now + timedelta(days=3, hours=4)
        ),
        JobApplication(
            user_id=g.user.id,
            company='Vercel',
            role='Frontend Platform Engineer',
            location='Remote',
            job_type='Full-time',
            status='applied',
            priority='high',
            salary_range='$130,000 - $160,000',
            url='https://vercel.com/careers',
            contact_name='David Chen',
            contact_email='dchen@vercel.com',
            notes='Applied via internal employee referral. Highlighted Next.js and Tailwind performance tuning.',
            next_step='Awaiting application review from hiring team.',
            applied_date=now - timedelta(days=4)
        ),
        JobApplication(
            user_id=g.user.id,
            company='Datadog',
            role='Backend Systems Developer',
            location='New York, NY (Hybrid)',
            job_type='Full-time',
            status='offer',
            priority='high',
            salary_range='$150,000 + Equity',
            url='https://www.datadoghq.com/careers/',
            contact_name='Elena Rostova',
            contact_email='elena.talent@datadoghq.com',
            notes='Received formal written offer! Competitive benefits and 401(k) matching. Decision deadline next Tuesday.',
            next_step='Review compensation package & negotiate signing bonus.',
            applied_date=now - timedelta(days=28),
            deadline=now + timedelta(days=5)
        ),
        JobApplication(
            user_id=g.user.id,
            company='Figma',
            role='UI Systems & Tools Engineer',
            location='Remote (US/Global)',
            job_type='Full-time',
            status='saved',
            priority='medium',
            salary_range='$140,000 - $170,000',
            url='https://figma.com/careers',
            notes='Need to polish resume with more canvas rendering and WebGL highlights before submitting.',
            next_step='Tailor STAR bullet points and draft cover letter.'
        ),
        JobApplication(
            user_id=g.user.id,
            company='Airbnb',
            role='Senior Backend Engineer',
            location='San Francisco, CA',
            job_type='Full-time',
            status='rejected',
            priority='medium',
            salary_range='$155,000 - $185,000',
            url='https://airbnb.com/careers',
            notes='Made it to Round 2. They chose a candidate with more distributed caching (Redis cluster) experience.',
            next_step='Added Redis & Distributed Systems to my Roadmap tasks.',
            applied_date=now - timedelta(days=35)
        )
    ]

    for item in samples:
        db.session.add(item)
    db.session.commit()

    return jsonify({
        'message': 'Seeded 5 representative job applications across Kanban stages.',
        'seeded': True,
        'count': len(samples)
    }), 201
