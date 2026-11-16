import pytest
import sys
from unittest.mock import patch, MagicMock
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

def test_health_check_without_ai_keys(client, monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', '')
    monkeypatch.setattr(Config, 'GROQ_API_KEY', '')
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['ai_service']['provider'] == 'Deterministic Heuristic Fallback'
    assert data['ai_service']['configured'] is False
    assert data['ai_service']['model'] == 'deterministic-heuristic'

def test_health_check_with_gemini(client, monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', 'valid_test_key_gemini_12345')
    monkeypatch.setattr(Config, 'GEMINI_MODEL', 'gemini-2.5-flash')
    monkeypatch.setattr(Config, 'GROQ_API_KEY', '')
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['ai_service']['provider'] == 'Google Gemini'
    assert data['ai_service']['configured'] is True
    assert data['ai_service']['model'] == 'gemini-2.5-flash'

def test_health_check_with_groq_when_gemini_missing(client, monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', '')
    monkeypatch.setattr(Config, 'GROQ_API_KEY', 'valid_test_key_groq_67890')
    monkeypatch.setattr(Config, 'GROQ_MODEL', 'qwen/qwen3.8-27b')
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['ai_service']['provider'] == 'Groq'
    assert data['ai_service']['configured'] is True
    assert data['ai_service']['model'] == 'qwen/qwen3.8-27b'

def test_assistant_chat_deterministic_fallback_when_both_keys_absent(client, monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', '')
    monkeypatch.setattr(Config, 'GROQ_API_KEY', '')
    res = client.post('/api/assistant/chat', json={
        'message': 'Help me improve my software developer resume with STAR bullets',
        'target_role': 'Software Developer'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['provider'] == 'deterministic_demo'
    assert data['is_live_ai'] is False
    assert 'Demo assistant mode — Gemini and Groq are unavailable' in data['disclaimer']
    assert len(data['reply']) > 50

def test_assistant_gemini_success_does_not_call_groq(monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', 'gemini_test_key')
    monkeypatch.setattr(Config, 'GROQ_API_KEY', 'groq_test_key')

    mock_gemini_resp = {
        'reply': 'Gemini live coaching advice: focus on quantifiable metrics.',
        'provider': 'google_gemini',
        'model': 'gemini-2.5-flash',
        'is_live_ai': True,
        'disclaimer': None
    }

    with patch.object(AIService, '_call_gemini_assistant', return_value=mock_gemini_resp) as mock_gemini, \
         patch.object(AIService, '_call_groq_assistant') as mock_groq:
        result = AIService.chat_assistant(
            message='How do I format ATS headers?',
            target_role='Backend Engineer'
        )

        mock_gemini.assert_called_once()
        mock_groq.assert_not_called()
        assert result['provider'] == 'google_gemini'
        assert result['is_live_ai'] is True
        assert result['disclaimer'] is None
        assert 'Gemini live coaching' in result['reply']

def test_assistant_gemini_failure_falls_back_to_groq(monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', 'gemini_test_key')
    monkeypatch.setattr(Config, 'GROQ_API_KEY', 'groq_test_key')
    monkeypatch.setattr(Config, 'GROQ_MODEL', 'qwen/qwen3.8-27b')

    mock_groq_resp = {
        'reply': 'Groq live fallback advice: use STAR method with 35% performance gains.',
        'provider': 'groq',
        'model': 'qwen/qwen3.8-27b',
        'is_live_ai': True,
        'disclaimer': None
    }

    with patch.object(AIService, '_call_gemini_assistant', side_effect=Exception('Gemini rate limit or timeout')), \
         patch.object(AIService, '_call_groq_assistant', return_value=mock_groq_resp) as mock_groq:
        result = AIService.chat_assistant(
            message='Give me 3 STAR bullet transformations',
            target_role='Full Stack Developer'
        )

        mock_groq.assert_called_once()
        assert result['provider'] == 'groq'
        assert result['model'] == 'qwen/qwen3.8-27b'
        assert result['is_live_ai'] is True
        assert result['disclaimer'] is None
        assert 'Groq live fallback' in result['reply']

def test_assistant_groq_failure_falls_back_to_deterministic(monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', 'gemini_test_key')
    monkeypatch.setattr(Config, 'GROQ_API_KEY', 'groq_test_key')

    with patch.object(AIService, '_call_gemini_assistant', side_effect=Exception('Gemini 503 unavailable')), \
         patch.object(AIService, '_call_groq_assistant', side_effect=Exception('Groq 429 rate limited')):
        result = AIService.chat_assistant(
            message='How is my score calculated?',
            target_role='Software Developer'
        )

        assert result['provider'] == 'deterministic_demo'
        assert result['is_live_ai'] is False
        assert 'Demo assistant mode — Gemini and Groq are unavailable' in result['disclaimer']
        assert result['reply'] is not None
        assert len(result['reply']) > 50

def test_assistant_groq_only_when_gemini_absent(monkeypatch):
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', '')
    monkeypatch.setattr(Config, 'GROQ_API_KEY', 'groq_test_key')

    mock_groq_resp = {
        'reply': 'Groq direct advice for technical interviews.',
        'provider': 'groq',
        'model': 'llama-3.3-70b-versatile',
        'is_live_ai': True,
        'disclaimer': None
    }

    with patch.object(AIService, '_call_gemini_assistant') as mock_gemini, \
         patch.object(AIService, '_call_groq_assistant', return_value=mock_groq_resp) as mock_groq:
        result = AIService.chat_assistant(
            message='Prepare me for system design interview',
            target_role='Backend Engineer'
        )

        mock_gemini.assert_not_called()
        mock_groq.assert_called_once()
        assert result['provider'] == 'groq'
        assert result['is_live_ai'] is True

def test_no_api_keys_leaked_in_assistant_response(monkeypatch):
    fake_gemini = 'secret_gemini_key_99999'
    fake_groq = 'gsk_secret_groq_key_88888'
    monkeypatch.setattr(Config, 'GEMINI_API_KEY', fake_gemini)
    monkeypatch.setattr(Config, 'GROQ_API_KEY', fake_groq)

    with patch.object(AIService, '_call_gemini_assistant', side_effect=Exception('Connection failed')), \
         patch.object(AIService, '_call_groq_assistant', side_effect=Exception('Timeout')):
        result = AIService.chat_assistant(
            message='Tell me about my career trajectory',
            target_role='Data Scientist'
        )

        result_str = str(result)
        assert fake_gemini not in result_str
        assert fake_groq not in result_str

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
    # Verify that openai is not imported or present in ai_service
    import app.services.ai_service as ai_module
    assert not hasattr(ai_module, 'OpenAI')
    assert 'openai' not in dir(ai_module)
    assert 'openai' not in sys.modules
