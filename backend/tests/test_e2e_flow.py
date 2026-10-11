import pytest
import os
import tempfile
import json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from app import create_app
from app.models import db, User

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def create_dummy_pdf(filepath):
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("<b>Elena Rostova</b>", styles['Title']),
        Paragraph("elena.rostova@example.com | San Francisco, CA | github.com/elenarostova", styles['Normal']),
        Spacer(1, 12),
        Paragraph("<b>PROFESSIONAL SUMMARY</b>", styles['Heading2']),
        Paragraph("Versatile Full Stack Developer with 3+ years experience building cloud-native web applications using Python, React, and PostgreSQL.", styles['Normal']),
        Spacer(1, 10),
        Paragraph("<b>TECHNICAL SKILLS</b>", styles['Heading2']),
        Paragraph("Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3", styles['Normal']),
        Paragraph("Frameworks: React, Flask, Node.js, Express, Tailwind CSS", styles['Normal']),
        Paragraph("Cloud & Tools: PostgreSQL, Docker, AWS, Git, Redis, REST APIs", styles['Normal']),
        Spacer(1, 10),
        Paragraph("<b>WORK EXPERIENCE</b>", styles['Heading2']),
        Paragraph("<b>Software Engineer</b> - NexaCloud Systems (2022 - Present)", styles['Normal']),
        Paragraph("• Architected backend microservices in Python Flask and PostgreSQL, reducing API latency by 32%.", styles['Normal']),
        Paragraph("• Engineered interactive frontend dashboards using React and TypeScript for 25,000 monthly active users.", styles['Normal']),
        Paragraph("• Implemented automated CI/CD deployment pipelines on AWS using Docker containers and GitHub Actions.", styles['Normal']),
        Spacer(1, 10),
        Paragraph("<b>EDUCATION</b>", styles['Heading2']),
        Paragraph("B.S. in Computer Science - University of California, Berkeley (2018 - 2022)", styles['Normal']),
    ]
    doc.build(story)

def test_full_application_lifecycle(client):
    # 1. Register User
    reg_res = client.post('/api/auth/register', json={
        'name': 'Elena Rostova',
        'email': 'elena.rostova@example.com',
        'password': 'SecurePassword123!',
        'target_role': 'Full Stack Developer',
        'education': 'UC Berkeley',
        'degree': 'B.S. Computer Science'
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.get_json()
    token = reg_data['token']
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Upload and Parse PDF Resume
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
        pdf_path = tmp.name

    try:
        create_dummy_pdf(pdf_path)
        with open(pdf_path, 'rb') as f:
            upload_res = client.post(
                '/api/resumes/upload',
                headers=headers,
                data={'file': (f, 'Elena_Rostova_Resume.pdf')}
            )
        assert upload_res.status_code == 201
        upload_data = upload_res.get_json()
        resume_id = upload_data['resume']['id']
        assert upload_data['resume']['parsed_data']['total_skills_count'] >= 6

        # 3. Create Analysis
        analysis_res = client.post('/api/analyses', headers=headers, json={
            'resume_id': resume_id,
            'target_role': 'Software Developer',
            'job_description': 'Looking for an experienced Python and React engineer with Docker and PostgreSQL skills.'
        })
        assert analysis_res.status_code == 201
        analysis_data = analysis_res.get_json()['analysis']
        analysis_id = analysis_data['id']
        assert analysis_data['quality_score'] >= 70
        assert analysis_data['job_match_score'] >= 65
        assert len(analysis_data['matched_skills']) >= 4

        # 4. Fetch Roadmap & Update Task
        roadmap_res = client.get('/api/roadmap', headers=headers)
        assert roadmap_res.status_code == 200
        tasks = roadmap_res.get_json()['tasks']
        assert len(tasks) > 0
        first_task_id = tasks[0]['id']

        patch_res = client.patch(f'/api/roadmap/{first_task_id}', headers=headers, json={
            'is_completed': True
        })
        assert patch_res.status_code == 200
        assert patch_res.get_json()['task']['is_completed'] is True

        # 5. Fetch Jobs and Search
        jobs_res = client.get('/api/jobs?query=python&type=all')
        assert jobs_res.status_code == 200
        jobs_data = jobs_res.get_json()
        assert len(jobs_data['jobs']) > 0

        # 6. Generate and Download PDF Report
        report_res = client.get(f'/api/analyses/{analysis_id}/report', headers=headers)
        assert report_res.status_code == 200
        assert report_res.headers['Content-Type'] == 'application/pdf'
        assert len(report_res.data) > 1000  # Non-empty PDF binary

        # 7. Update User Profile
        profile_update = client.put('/api/profile', headers=headers, json={
            'preferred_location': 'San Francisco (Hybrid)',
            'career_interests': 'Distributed Cloud Architectures'
        })
        assert profile_update.status_code == 200
        assert profile_update.get_json()['profile']['preferred_location'] == 'San Francisco (Hybrid)'

        # 8. Check System Health
        health_res = client.get('/api/health')
        assert health_res.status_code == 200
        assert health_res.get_json()['status'] == 'healthy'

    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
