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
            db.drop_all()

@pytest.fixture
def auth_headers(client):
    res = client.post('/api/auth/register', json={
        'name': 'Test Candidate',
        'email': 'candidate@meresumax.dev',
        'password': 'Password123!',
        'target_role': 'Full Stack Developer'
    })
    token = res.get_json()['token']
    return {'Authorization': f'Bearer {token}'}

def test_application_lifecycle(client, auth_headers):
    # 1. Create a new application in 'saved' status
    res = client.post('/api/applications', json={
        'company': 'Google',
        'role': 'Senior Software Engineer',
        'location': 'Mountain View, CA (Hybrid)',
        'job_type': 'Full-time',
        'status': 'saved',
        'priority': 'high',
        'salary_range': '$180k - $220k',
        'url': 'https://careers.google.com',
        'notes': 'Preparing systems design and concurrency topics.'
    }, headers=auth_headers)
    assert res.status_code == 201
    created = res.get_json()['application']
    app_id = created['id']
    assert created['company'] == 'Google'
    assert created['status'] == 'saved'
    assert created['priority'] == 'high'

    # 2. Get applications list and check stats
    res = client.get('/api/applications', headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert len(data['applications']) == 1
    assert data['stats']['total'] == 1
    assert data['stats']['saved'] == 1
    assert data['stats']['applied'] == 0

    # 3. Transition to 'applied' status
    res = client.patch(f'/api/applications/{app_id}', json={
        'status': 'applied',
        'next_step': 'Awaiting recruiter screening email.'
    }, headers=auth_headers)
    assert res.status_code == 200
    updated = res.get_json()['application']
    assert updated['status'] == 'applied'
    assert updated['next_step'] == 'Awaiting recruiter screening email.'
    assert updated['applied_date'] is not None

    # 4. Transition to 'interviewing' with upcoming interview date
    res = client.patch(f'/api/applications/{app_id}', json={
        'status': 'interviewing',
        'interview_date': '2026-11-01T15:00:00',
        'next_step': 'Technical Screen on Leetcode & System Design'
    }, headers=auth_headers)
    assert res.status_code == 200
    interviewing = res.get_json()['application']
    assert interviewing['status'] == 'interviewing'
    assert interviewing['is_interview_upcoming'] is True

    # 5. Check stats reflect conversion
    res = client.get('/api/applications', headers=auth_headers)
    data = res.get_json()
    assert data['stats']['interviewing'] == 1
    assert data['stats']['conversion_rate'] == 100.0

    # 6. Delete application
    del_res = client.delete(f'/api/applications/{app_id}', headers=auth_headers)
    assert del_res.status_code == 200

    # Verify list is empty
    empty_res = client.get('/api/applications', headers=auth_headers)
    assert len(empty_res.get_json()['applications']) == 0

def test_seed_sample_applications(client, auth_headers):
    # Seed sample applications
    seed_res = client.post('/api/applications/seed-sample', headers=auth_headers)
    assert seed_res.status_code == 201
    assert seed_res.get_json()['seeded'] is True

    # Check that 5 items were seeded across stages
    res = client.get('/api/applications', headers=auth_headers)
    data = res.get_json()
    assert len(data['applications']) == 5
    assert data['stats']['total'] == 5
    assert data['stats']['saved'] >= 1
    assert data['stats']['applied'] >= 1
    assert data['stats']['interviewing'] >= 1
    assert data['stats']['offer'] >= 1

    # Filter by status = 'interviewing'
    filter_res = client.get('/api/applications?status=interviewing', headers=auth_headers)
    filtered = filter_res.get_json()
    assert all(a['status'] == 'interviewing' for a in filtered['applications'])

    # Search for 'Stripe'
    search_res = client.get('/api/applications?search=stripe', headers=auth_headers)
    search_data = search_res.get_json()
    assert len(search_data['applications']) == 1
    assert search_data['applications'][0]['company'] == 'Stripe'
