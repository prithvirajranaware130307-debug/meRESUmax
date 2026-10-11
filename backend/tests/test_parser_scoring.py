import pytest
from app.services.parser import ResumeParser
from app.services.scorer import ResumeScorer
from app.services.matcher import JobMatcher

SAMPLE_RESUME_TEXT = """
Alex Mercer
alex.mercer@example.com | (555) 019-2834 | github.com/alexmercer

PROFESSIONAL SUMMARY
Passionate Software Developer with 2 years of hands-on experience designing and deploying 
scalable web applications. Proficient in Python, JavaScript, React, and PostgreSQL.

EDUCATION
Bachelor of Science in Computer Science
State University, Graduated May 2024 | GPA: 3.8/4.0

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, HTML, CSS
Frameworks: React, Flask, Node.js, Express, Tailwind CSS
Databases & Cloud: PostgreSQL, SQLite, MongoDB, Docker, Git, AWS

PROJECTS
CloudMetrics Dashboard (React, Python, PostgreSQL, Docker)
• Architected a real-time analytics portal that processed 15,000 requests daily with sub-80ms latency.
• Engineered responsive frontend with React and Tailwind CSS, reducing layout shifts by 40%.
• Deployed containerized microservices to AWS utilizing Docker and GitHub Actions CI/CD.

TaskSphere API Engine (Python, Flask, SQLite)
• Developed RESTful endpoints for enterprise workflow automation serving 1,200 active users.
• Implemented JWT authentication and role-based permissions, decreasing auth failures by 25%.
"""

def test_skill_extraction():
    skills_info = ResumeParser.extract_skills(SAMPLE_RESUME_TEXT)
    skills = skills_info['skills_list']
    assert 'Python' in skills
    assert 'JavaScript' in skills
    assert 'React' in skills
    assert 'PostgreSQL' in skills
    assert 'Docker' in skills
    assert len(skills) >= 8

def test_heuristic_scoring():
    parsed_data = {
        'text': SAMPLE_RESUME_TEXT,
        'sections': ResumeParser.extract_sections(SAMPLE_RESUME_TEXT),
        'skills': ResumeParser.extract_skills(SAMPLE_RESUME_TEXT)['skills_list'],
        'word_count': len(SAMPLE_RESUME_TEXT.split())
    }
    
    scoring = ResumeScorer.calculate_quality_score(parsed_data, target_role='Software Developer')
    score = scoring['overall_score']
    assert 60 <= score <= 98
    assert 'category_scores' in scoring
    assert len(scoring['strengths']) > 0

def test_job_matching():
    parsed_data = {
        'text': SAMPLE_RESUME_TEXT,
        'skills': ResumeParser.extract_skills(SAMPLE_RESUME_TEXT)['skills_list']
    }
    
    match_result = JobMatcher.match_resume_to_role(parsed_data, target_role='Software Developer')
    assert match_result['match_score'] > 50
    assert 'Python' in match_result['matched_skills']
    assert 'React' in match_result['matched_skills'] or 'SQL' in match_result['matched_skills']
