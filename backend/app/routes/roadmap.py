from datetime import datetime
from flask import Blueprint, request, jsonify, g
from ..models import db, RoadmapTask
from ..utils.auth_helper import auth_required

roadmap_bp = Blueprint('roadmap', __name__, url_prefix='/api/roadmap')

@roadmap_bp.route('', methods=['GET'])
@auth_required
def get_roadmap():
    tasks = RoadmapTask.query.filter_by(user_id=g.user.id).order_by(RoadmapTask.created_at.asc()).all()
    return jsonify({'tasks': [t.to_dict() for t in tasks]}), 200

@roadmap_bp.route('', methods=['POST'])
@auth_required
def add_task():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Task title is required.'}), 400

    task = RoadmapTask(
        user_id=g.user.id,
        analysis_id=data.get('analysis_id'),
        title=title,
        description=data.get('description', ''),
        priority=data.get('priority', 'medium'),
        category=data.get('category', 'skill'),
        target_date=data.get('target_date', '')
    )
    task.resources = data.get('resources', [])
    
    db.session.add(task)
    db.session.commit()
    return jsonify({'message': 'Roadmap task added.', 'task': task.to_dict()}), 201

@roadmap_bp.route('/<int:task_id>', methods=['PATCH'])
@auth_required
def update_task(task_id):
    task = RoadmapTask.query.filter_by(id=task_id, user_id=g.user.id).first()
    if not task:
        return jsonify({'error': 'Task not found or unauthorized.'}), 404

    data = request.get_json() or {}
    if 'is_completed' in data:
        task.is_completed = bool(data['is_completed'])
        task.completed_at = datetime.utcnow() if task.is_completed else None
    
    if 'title' in data and data['title'].strip():
        task.title = data['title'].strip()
    if 'description' in data:
        task.description = data['description']
    if 'priority' in data:
        task.priority = data['priority']
    if 'target_date' in data:
        task.target_date = data['target_date']

    db.session.commit()
    return jsonify({'message': 'Task updated.', 'task': task.to_dict()}), 200

@roadmap_bp.route('/<int:task_id>', methods=['DELETE'])
@auth_required
def delete_task(task_id):
    task = RoadmapTask.query.filter_by(id=task_id, user_id=g.user.id).first()
    if not task:
        return jsonify({'error': 'Task not found or unauthorized.'}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted from roadmap.'}), 200
