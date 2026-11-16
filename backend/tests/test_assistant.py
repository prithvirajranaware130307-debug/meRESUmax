import pytest
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
            db.session.remove()
            db.drop_all()

def test_chat_assistant_validation(client):
    res = client.post('/api/assistant/chat', json={})
    assert res.status_code == 400
    assert 'error' in res.get_json()

def test_chat_assistant_quick_actions(client):
    # Test "improve resume" prompt
    res = client.post('/api/assistant/chat', json={
        'message': 'Improve my resume',
        'target_role': 'Frontend Developer'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'reply' in data
    assert 'STAR' in data['reply'] or 'React' in data['reply']
    assert 'provider' in data

    # Test "explain score" prompt
    res_score = client.post('/api/assistant/chat', json={
        'message': 'Explain my score',
        'target_role': 'Backend Developer'
    })
    assert res_score.status_code == 200
    data_score = res_score.get_json()
    assert 'score' in data_score['reply'].lower() or 'heuristic' in data_score['reply'].lower()

    # Test /api/chat alias
    res_alias = client.post('/api/chat', json={
        'message': 'Prepare interview questions',
        'target_role': 'AI/ML Engineer'
    })
    assert res_alias.status_code == 200
    data_alias = res_alias.get_json()
    assert 'reply' in data_alias

def test_chat_assistant_fallback_topics(client):
    # Test ATS formatting query
    res_ats = client.post('/api/assistant/chat', json={
        'message': 'What are the ATS formatting guidelines for my resume?',
        'target_role': 'Full Stack Developer'
    })
    assert res_ats.status_code == 200
    reply_ats = res_ats.get_json()['reply'].lower()
    assert 'ats' in reply_ats or 'layout' in reply_ats or 'column' in reply_ats

    # Test Roadmap query
    res_roadmap = client.post('/api/assistant/chat', json={
        'message': 'Give me a roadmap to upskill in cloud technologies',
        'target_role': 'Cloud Engineer'
    })
    assert res_roadmap.status_code == 200
    reply_roadmap = res_roadmap.get_json()['reply'].lower()
    assert 'roadmap' in reply_roadmap or 'sprint' in reply_roadmap or 'milestone' in reply_roadmap

    # Test Account query
    res_account = client.post('/api/assistant/chat', json={
        'message': 'How do I delete my account or uploaded resumes?',
        'target_role': 'Software Developer'
    })
    assert res_account.status_code == 200
    reply_account = res_account.get_json()['reply'].lower()
    assert 'account' in reply_account or 'profile' in reply_account

    # Test Job matching query
    res_jobs = client.post('/api/assistant/chat', json={
        'message': 'Find matching jobs for my profile',
        'target_role': 'Data Scientist'
    })
    assert res_jobs.status_code == 200
    reply_jobs = res_jobs.get_json()['reply'].lower()
    assert 'job' in reply_jobs or 'opportunity' in reply_jobs

    # Test Career strategy query
    res_career = client.post('/api/assistant/chat', json={
        'message': 'Tips for salary negotiation and career transition',
        'target_role': 'Engineering Manager'
    })
    assert res_career.status_code == 200
    reply_career = res_career.get_json()['reply'].lower()
    assert 'career' in reply_career or 'salary' in reply_career
