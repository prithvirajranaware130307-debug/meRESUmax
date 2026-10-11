from datetime import datetime
import json
from . import db

class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(100), unique=True, index=True)
    provider = db.Column(db.String(50), default='adzuna')  # adzuna, jsearch, curated
    
    title = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    
    _required_skills = db.Column('required_skills', db.Text, default='[]')
    
    salary_min = db.Column(db.Float, nullable=True)
    salary_max = db.Column(db.Float, nullable=True)
    salary_currency = db.Column(db.String(10), default='USD')
    
    job_type = db.Column(db.String(50), default='Full-time')  # Full-time, Internship, Contract
    experience_level = db.Column(db.String(50), default='Entry Level')
    url = db.Column(db.String(500), nullable=False)
    is_demo = db.Column(db.Boolean, default=False)
    
    posted_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def required_skills(self):
        try:
            return json.loads(self._required_skills or '[]')
        except Exception:
            return []

    @required_skills.setter
    def required_skills(self, v):
        self._required_skills = json.dumps(v)

    def to_dict(self):
        return {
            'id': self.id,
            'external_id': self.external_id,
            'provider': self.provider,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'description': self.description,
            'required_skills': self.required_skills,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'salary_currency': self.salary_currency,
            'job_type': self.job_type,
            'experience_level': self.experience_level,
            'url': self.url,
            'is_demo': self.is_demo,
            'posted_at': self.posted_at.isoformat() if self.posted_at else None
        }

class SavedJob(db.Model):
    __tablename__ = 'saved_jobs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False, index=True)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)

    job = db.relationship('Job')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'saved_at': self.saved_at.isoformat() if self.saved_at else None,
            'job': self.job.to_dict() if self.job else None
        }
