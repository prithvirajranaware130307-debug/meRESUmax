import pytest
import time
import base64
import json
import hmac
import hashlib
from app import create_app
from app.models import db, User
from app.config import Config

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
    assert data['user']['target_role'] == 'Full Stack Developer'
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

def test_register_duplicate_email(client):
    res1 = client.post('/api/auth/register', json={
        'name': 'User One',
        'email': 'duplicate@example.com',
        'password': 'password123'
    })
    assert res1.status_code == 201

    # Second registration with same email should fail with 409
    res2 = client.post('/api/auth/register', json={
        'name': 'User Two',
        'email': 'duplicate@example.com',
        'password': 'password456'
    })
    assert res2.status_code == 409
    assert 'already exists' in res2.get_json().get('error', '').lower()

def test_register_invalid_email_format(client):
    invalid_emails = ['notanemail', 'user@', 'user@domain', 'user.com', '@nodomain.com']
    for bad_email in invalid_emails:
        res = client.post('/api/auth/register', json={
            'name': 'Invalid Email User',
            'email': bad_email,
            'password': 'password123'
        })
        assert res.status_code == 400
        assert 'valid email' in res.get_json().get('error', '').lower()

def test_register_weak_password(client):
    # Passwords shorter than 6 characters must be rejected
    res = client.post('/api/auth/register', json={
        'name': 'Short Pass',
        'email': 'shortpass@example.com',
        'password': '123'
    })
    assert res.status_code == 400
    assert 'at least 6 characters' in res.get_json().get('error', '').lower()

def test_register_missing_fields(client):
    # Missing name
    res_no_name = client.post('/api/auth/register', json={
        'email': 'noname@example.com',
        'password': 'password123'
    })
    assert res_no_name.status_code == 400
    assert 'name' in res_no_name.get_json().get('error', '').lower()

    # Missing email
    res_no_email = client.post('/api/auth/register', json={
        'name': 'No Email',
        'password': 'password123'
    })
    assert res_no_email.status_code == 400
    assert 'email' in res_no_email.get_json().get('error', '').lower()

    # Missing password
    res_no_pass = client.post('/api/auth/register', json={
        'name': 'No Pass',
        'email': 'nopass@example.com'
    })
    assert res_no_pass.status_code == 400
    assert 'password' in res_no_pass.get_json().get('error', '').lower()

def test_invalid_login(client):
    # Nonexistent user
    res = client.post('/api/auth/login', json={
        'email': 'nonexistent@example.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401

def test_login_validation_failures(client):
    # Missing email
    res1 = client.post('/api/auth/login', json={'password': 'secretpassword'})
    assert res1.status_code == 400

    # Missing password
    res2 = client.post('/api/auth/login', json={'email': 'user@example.com'})
    assert res2.status_code == 400

    # Malformed email
    res3 = client.post('/api/auth/login', json={'email': 'not-an-email', 'password': 'secretpassword'})
    assert res3.status_code == 400

def test_protected_route_unauthorized(client):
    # No auth header
    res1 = client.get('/api/auth/me')
    assert res1.status_code == 401

    # Malformed token
    res2 = client.get('/api/auth/me', headers={'Authorization': 'Bearer malformed.token.value'})
    assert res2.status_code == 401

    # Expired token
    expired_payload = {
        'uid': 1,
        'exp': int(time.time()) - 3600  # 1 hour in the past
    }
    payload_b64 = base64.urlsafe_b64encode(json.dumps(expired_payload).encode()).decode()
    signature = hmac.new(Config.SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    expired_token = f"{payload_b64}.{signature}"

    res3 = client.get('/api/auth/me', headers={'Authorization': f'Bearer {expired_token}'})
    assert res3.status_code == 401
