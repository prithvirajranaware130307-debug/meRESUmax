import os
import tempfile
from app.services.report_generator import ReportGenerator

def test_report_generation():
    sample_analysis = {
        'id': 1,
        'target_role': 'Software Developer',
        'resume_filename': 'alex_mercer_resume.pdf',
        'quality_score': 84.5,
        'job_match_score': 88.0,
        'created_at': '2026-10-10T12:00:00',
        'category_scores': {
            'structure': {'title': 'Structure & Completeness', 'score': 18, 'max': 20, 'percentage': 90},
            'skills': {'title': 'Relevant Skills Depth', 'score': 22, 'max': 25, 'percentage': 88},
            'experience': {'title': 'Projects & Experience', 'score': 21, 'max': 25, 'percentage': 84},
            'clarity': {'title': 'Clarity & Formatting', 'score': 13, 'max': 15, 'percentage': 87},
            'impact': {'title': 'Measurable Impact', 'score': 10.5, 'max': 15, 'percentage': 70}
        },
        'matched_skills': ['Python', 'JavaScript', 'React', 'PostgreSQL', 'Docker', 'Git'],
        'missing_skills': ['Kubernetes', 'Redis', 'CI/CD'],
        'strengths': ['Strong structural coverage', 'Quantifiable metrics highlighted'],
        'improvements': ['Add metrics to experience section', 'Expand testing keywords'],
        'ai_feedback': {
            'summary_rewrite': 'Dynamic Software Engineer experienced in React, Python, and cloud services.',
            'roadmap_milestones': [
                {'title': 'Master Kubernetes & Containers', 'description': 'Build container orchestration', 'priority': 'high'}
            ]
        }
    }

    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
        tmp_path = tmp.name

    try:
        res_path = ReportGenerator.generate_pdf_report(sample_analysis, tmp_path)
        assert os.path.exists(res_path)
        assert os.path.getsize(res_path) > 1000  # valid PDF generated
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
