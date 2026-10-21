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
