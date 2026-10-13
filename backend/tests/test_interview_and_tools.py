import pytest
from app import create_app
from app.models import db

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

def test_interview_questions_generation(client):
    res = client.post('/api/interview/questions', json={
        'target_role': 'Frontend Developer',
        'difficulty': 'Mid-Level',
        'skills': ['React', 'TypeScript', 'Tailwind CSS']
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'questions' in data
    assert len(data['questions']) >= 3
    q1 = data['questions'][0]
    assert 'question' in q1
    assert 'category' in q1

def test_interview_answer_evaluation(client):
    res = client.post('/api/interview/evaluate', json={
        'question': 'How do you optimize React performance?',
        'category': 'Technical Depth',
        'candidate_answer': 'In my last project, I reduced initial bundle size by 35% by implementing dynamic imports and code splitting with React.lazy. I also memoized heavy chart components using useMemo and React.memo, reducing re-render time from 120ms to 18ms for 50,000 active users.',
        'target_role': 'Frontend Developer',
        'difficulty': 'Mid-Level'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'overall_score' in data
    assert 'star_score' in data
    assert 'strengths' in data
    assert 'suggested_exemplar_answer' in data
    assert data['overall_score'] > 50

def test_cover_letter_generation(client):
    res = client.post('/api/tools/cover-letter', json={
        'candidate_name': 'Alex Mercer',
        'target_role': 'Senior Full Stack Engineer',
        'company_name': 'Stripe',
        'skills': ['Python', 'React', 'PostgreSQL', 'Docker'],
        'tone': 'Confident & Impact-Driven'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'cover_letter' in data
    assert 'Stripe' in data['cover_letter']
    assert 'Alex Mercer' in data['cover_letter']

def test_linkedin_generation(client):
    res = client.post('/api/tools/linkedin', json={
        'candidate_name': 'Alex Mercer',
        'target_role': 'Staff Engineer',
        'skills': ['Distributed Systems', 'Python', 'AWS']
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'headlines' in data
    assert len(data['headlines']) >= 1
    assert 'about_section' in data
    assert len(data['about_section']) > 50
    assert 'engineer' in data['about_section'].lower()
