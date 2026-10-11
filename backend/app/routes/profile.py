from flask import Blueprint, request, jsonify, g
from ..models import db, User
from ..utils.auth_helper import auth_required

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('', methods=['GET'])
@auth_required
def get_profile():
    return jsonify({'profile': g.user.to_dict()}), 200

@profile_bp.route('', methods=['PUT'])
@auth_required
def update_profile():
    data = request.get_json() or {}
    user = g.user

    if 'name' in data and data['name'].strip():
        user.name = data['name'].strip()
    if 'education' in data:
        user.education = data['education'].strip()
    if 'degree' in data:
        user.degree = data['degree'].strip()
    if 'graduation_year' in data:
        user.graduation_year = data['graduation_year'].strip()
    if 'target_role' in data and data['target_role'].strip():
        user.target_role = data['target_role'].strip()
    if 'preferred_location' in data:
        user.preferred_location = data['preferred_location'].strip()
    if 'career_interests' in data:
        user.career_interests = data['career_interests'].strip()

    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully.',
        'profile': user.to_dict()
    }), 200

account_bp = Blueprint('account', __name__, url_prefix='/api/account')

@account_bp.route('', methods=['DELETE'])
@auth_required
def delete_account():
    user = g.user
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Your account, uploaded resumes, analyses, and saved data have been permanently deleted.'}), 200
