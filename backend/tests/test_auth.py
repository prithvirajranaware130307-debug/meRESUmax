import pytest
import os
import tempfile
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

def test_register_and_login(client):
    # Register
    res = client.post('/api/auth/register', json={
        'name': 'Alex Mercer',
        'email': 'alex@example.com',
        'password': 'password123',
        'target_role': 'Full Stack Developer'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert 'token' in data
    assert data['user']['email'] == 'alex@example.com'
    token = data['token']

    # Login
    res_login = client.post('/api/auth/login', json={
        'email': 'alex@example.com',
        'password': 'password123'
    })
    assert res_login.status_code == 200
    assert 'token' in res_login.get_json()

    # Verify protected /me endpoint
    res_me = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert res_me.status_code == 200
    assert res_me.get_json()['user']['name'] == 'Alex Mercer'

def test_invalid_login(client):
    res = client.post('/api/auth/login', json={
        'email': 'nonexistent@example.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401
