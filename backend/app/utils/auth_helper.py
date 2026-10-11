import base64
import json
import time
import hmac
import hashlib
from functools import wraps
from flask import request, jsonify, g
from ..config import Config
from ..models import db, User

def generate_token(user_id: int) -> str:
    payload = {
        'uid': user_id,
        'exp': int(time.time()) + 86400 * 7  # 7 days
    }
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    signature = hmac.new(Config.SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"

def verify_token(token: str):
    if not token or '.' not in token:
        return None
    try:
        payload_b64, signature = token.split('.', 1)
        expected_sig = hmac.new(Config.SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        
        payload_json = base64.urlsafe_b64decode(payload_b64.encode()).decode()
        payload = json.loads(payload_json)
        
        if payload.get('exp', 0) < time.time():
            return None
            
        return payload.get('uid')
    except Exception:
        return None

def get_current_user():
    auth_header = request.headers.get('Authorization', '')
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1].strip()
    elif 'token' in request.cookies:
        token = request.cookies.get('token')
    elif request.args.get('token'):
        token = request.args.get('token')
    
    if not token:
        return None
        
    user_id = verify_token(token)
    if not user_id:
        return None
        
    return db.session.get(User, user_id)

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Unauthorized: Please log in or provide a valid session token.'}), 401
        g.user = user
        return f(*args, **kwargs)
    return decorated
