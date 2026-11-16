import pytest
import sys
from app import create_app
from app.models import db
from app.config import Config
from app.services.ai_service import AIService

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

def test_health_check_without_gemini(client, monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', '')
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['ai_service']['provider'] == 'Deterministic Heuristic Fallback'
    assert data['ai_service']['configured'] is False
    assert data['ai_service']['model'] == 'deterministic-heuristic'

def test_health_check_with_gemini(client, monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', 'valid_test_key_gemini_12345')
    monkeypatch.setattr(Config, 'GEMINI_MODEL', 'gemini-2.5-flash')
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['ai_service']['provider'] == 'Google Gemini'
    assert data['ai_service']['configured'] is True
    assert data['ai_service']['model'] == 'gemini-2.5-flash'

def test_assistant_chat_deterministic_fallback(client, monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', '')
    res = client.post('/api/assistant/chat', json={
        'message': 'Help me improve my software developer resume with STAR bullets',
        'target_role': 'Software Developer'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['provider'] == 'deterministic_demo'
    assert data['is_live_ai'] is False
    assert 'Demo Engine Fallback (Deterministic Mode)' in data['disclaimer']
    assert len(data['reply']) > 50

def test_resume_intelligence_deterministic_fallback(monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', '')
    result = AIService.generate_resume_intelligence(
        resume_text="Experienced engineer with Python and React.",
        skills=["Python", "React", "SQL"],
        target_role="Full Stack Developer",
        quality_score=78.5,
        matched_skills=["Python", "React"],
        missing_skills=["Docker", "Kubernetes"]
    )
    assert result['provider'] == 'deterministic_fallback'
    assert result['is_live_ai'] is False
    assert 'executive_summary' in result
    assert 'better_bullet_examples' in result
    assert len(result['better_bullet_examples']) >= 1

def test_no_openai_module_in_ai_service():
    # Verify that openai is not in the imported modules namespace of ai_service
    import app.services.ai_service as ai_module
    assert not hasattr(ai_module, 'OpenAI')
    assert 'openai' not in dir(ai_module)
