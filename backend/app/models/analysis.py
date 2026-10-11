from datetime import datetime
import json
from . import db

class Analysis(db.Model):
    __tablename__ = 'analyses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False, index=True)
    target_role = db.Column(db.String(100), nullable=False)
    
    # Heuristic scores (0-100)
    quality_score = db.Column(db.Float, nullable=False, default=0.0)
    job_match_score = db.Column(db.Float, nullable=False, default=0.0)
    
    # Detailed category scores and breakdowns (stored as JSON)
    _category_scores = db.Column('category_scores', db.Text, default='{}')
    _strengths = db.Column('strengths', db.Text, default='[]')
    _weaknesses = db.Column('weaknesses', db.Text, default='[]')
    _improvements = db.Column('improvements', db.Text, default='[]')
    _matched_skills = db.Column('matched_skills', db.Text, default='[]')
    _missing_skills = db.Column('missing_skills', db.Text, default='[]')
    _ai_feedback = db.Column('ai_feedback', db.Text, default='{}')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    roadmap_tasks = db.relationship('RoadmapTask', backref='analysis', cascade='all, delete-orphan', lazy=True)

    def _get_json(self, field, default):
        try:
            val = getattr(self, field)
            return json.loads(val) if val else default
        except Exception:
            return default

    def _set_json(self, field, val):
        setattr(self, field, json.dumps(val))

    @property
    def category_scores(self): return self._get_json('_category_scores', {})
    @category_scores.setter
    def category_scores(self, v): self._set_json('_category_scores', v)

    @property
    def strengths(self): return self._get_json('_strengths', [])
    @strengths.setter
    def strengths(self, v): self._set_json('_strengths', v)

    @property
    def weaknesses(self): return self._get_json('_weaknesses', [])
    @weaknesses.setter
    def weaknesses(self, v): self._set_json('_weaknesses', v)

    @property
    def improvements(self): return self._get_json('_improvements', [])
    @improvements.setter
    def improvements(self, v): self._set_json('_improvements', v)

    @property
    def matched_skills(self): return self._get_json('_matched_skills', [])
    @matched_skills.setter
    def matched_skills(self, v): self._set_json('_matched_skills', v)

    @property
    def missing_skills(self): return self._get_json('_missing_skills', [])
    @missing_skills.setter
    def missing_skills(self, v): self._set_json('_missing_skills', v)

    @property
    def ai_feedback(self): return self._get_json('_ai_feedback', {})
    @ai_feedback.setter
    def ai_feedback(self, v): self._set_json('_ai_feedback', v)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'resume_id': self.resume_id,
            'resume_filename': self.resume.original_filename if self.resume else 'Resume',
            'target_role': self.target_role,
            'quality_score': round(self.quality_score, 1),
            'job_match_score': round(self.job_match_score, 1),
            'category_scores': self.category_scores,
            'strengths': self.strengths,
            'weaknesses': self.weaknesses,
            'improvements': self.improvements,
            'matched_skills': self.matched_skills,
            'missing_skills': self.missing_skills,
            'ai_feedback': self.ai_feedback,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'roadmap_task_count': len(self.roadmap_tasks)
        }
