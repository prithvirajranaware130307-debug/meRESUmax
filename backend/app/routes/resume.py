import os
import uuid
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from ..config import Config
from ..models import db, Resume
from ..services.parser import ResumeParser
from ..utils.auth_helper import auth_required

resume_bp = Blueprint('resumes', __name__, url_prefix='/api/resumes')

@resume_bp.route('/upload', methods=['POST'])
@auth_required
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request.'}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected for upload.'}), 400

    original_filename = secure_filename(file.filename)
    ext = original_filename.rsplit('.', 1)[-1].lower() if '.' in original_filename else ''
    
    if ext not in Config.ALLOWED_EXTENSIONS:
        return jsonify({'error': f"Unsupported file type (.{ext}). Supported types are .pdf and .docx."}), 400

    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
    file_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
    
    file.save(file_path)
    file_size = os.path.getsize(file_path)

    try:
        parsed_result = ResumeParser.parse_file(file_path)
        
        resume = Resume(
            user_id=g.user.id,
            filename=unique_filename,
            original_filename=original_filename,
            file_type=ext,
            file_size=file_size,
            extracted_text=parsed_result['text'],
            status='parsed'
        )
        resume.parsed_data = {
            'word_count': parsed_result['word_count'],
            'sections': parsed_result['sections'],
            'skills': parsed_result['skills'],
            'skills_by_category': parsed_result['skills_by_category'],
            'total_skills_count': parsed_result['total_skills_count']
        }

        db.session.add(resume)
        db.session.commit()

        return jsonify({
            'message': 'Resume uploaded and parsed successfully.',
            'resume': resume.to_dict()
        }), 201

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'error': f"Failed to parse resume: {str(e)}"}), 422

@resume_bp.route('', methods=['GET'])
@auth_required
def list_resumes():
    resumes = Resume.query.filter_by(user_id=g.user.id).order_by(Resume.upload_date.desc()).all()
    return jsonify({'resumes': [r.to_dict() for r in resumes]}), 200

@resume_bp.route('/<int:resume_id>', methods=['GET'])
@auth_required
def get_resume(resume_id):
    resume = Resume.query.filter_by(id=resume_id, user_id=g.user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or unauthorized.'}), 404
    return jsonify({'resume': resume.to_dict()}), 200

@resume_bp.route('/<int:resume_id>', methods=['DELETE'])
@auth_required
def delete_resume(resume_id):
    resume = Resume.query.filter_by(id=resume_id, user_id=g.user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or unauthorized.'}), 404

    # Remove physical file if present
    file_path = os.path.join(Config.UPLOAD_FOLDER, resume.filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

    db.session.delete(resume)
    db.session.commit()
    return jsonify({'message': 'Resume deleted successfully.'}), 200
