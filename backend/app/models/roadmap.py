from datetime import datetime
import json
from . import db

class RoadmapTask(db.Model):
    __tablename__ = 'roadmap_tasks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    analysis_id = db.Column(db.Integer, db.ForeignKey('analyses.id', ondelete='SET NULL'), nullable=True, index=True)
    
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    priority = db.Column(db.String(20), default='medium')  # high, medium, low
    category = db.Column(db.String(50), default='skill')   # skill, project, certification, interview
    
    _resources = db.Column('resources', db.Text, default='[]')
    is_completed = db.Column(db.Boolean, default=False)
    target_date = db.Column(db.String(50), default='')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    @property
    def resources(self):
        try:
            return json.loads(self._resources or '[]')
        except Exception:
            return []

    @resources.setter
    def resources(self, v):
        self._resources = json.dumps(v)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'analysis_id': self.analysis_id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'category': self.category,
            'resources': self.resources,
            'is_completed': self.is_completed,
            'target_date': self.target_date,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
