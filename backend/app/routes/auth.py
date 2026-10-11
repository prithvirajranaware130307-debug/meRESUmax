import re
from flask import Blueprint, request, jsonify, g
from ..models import db, User
from ..utils.auth_helper import generate_token, auth_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    name = data.get('name', '').strip()
    target_role = data.get('target_role', 'Software Developer').strip()

    missing_fields = []
    if not name:
        missing_fields.append('name')
    if not email:
        missing_fields.append('email')
    if not password:
        missing_fields.append('password')

    if missing_fields:
        return jsonify({'error': f"Missing required fields: {', '.join(missing_fields)}."}), 400

    if not EMAIL_REGEX.match(email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email address already exists. Please sign in instead.'}), 409

    user = User(
        email=email,
        name=name,
        target_role=target_role or 'Software Developer',
        education=data.get('education', '').strip(),
        degree=data.get('degree', '').strip()
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id)
    return jsonify({
        'message': 'Account registered successfully.',
        'token': token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Both email and password are required to sign in.'}), 400

    if not EMAIL_REGEX.match(email):
        return jsonify({'error': 'Please enter a valid email address format.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password. Please verify your credentials and try again.'}), 401

    token = generate_token(user.id)
    return jsonify({
        'message': 'Login successful.',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully.'}), 200

@auth_bp.route('/me', methods=['GET'])
@auth_required
def get_me():
    return jsonify({'user': g.user.to_dict()}), 200

@auth_bp.route('/current-user', methods=['GET'])
@auth_required
def get_current_user_endpoint():
    return jsonify({'user': g.user.to_dict()}), 200
