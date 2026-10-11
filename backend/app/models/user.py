from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    
    # Career Profile
    education = db.Column(db.String(200), default='')
    degree = db.Column(db.String(150), default='')
    graduation_year = db.Column(db.String(10), default='')
    target_role = db.Column(db.String(100), default='Software Developer')
    preferred_location = db.Column(db.String(100), default='Remote / Hybrid')
    career_interests = db.Column(db.Text, default='')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    resumes = db.relationship('Resume', backref='owner', cascade='all, delete-orphan', lazy=True)
    analyses = db.relationship('Analysis', backref='user', cascade='all, delete-orphan', lazy=True)
    saved_jobs = db.relationship('SavedJob', backref='user', cascade='all, delete-orphan', lazy=True)
    roadmap_tasks = db.relationship('RoadmapTask', backref='user', cascade='all, delete-orphan', lazy=True)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'education': self.education or '',
            'degree': self.degree or '',
            'graduation_year': self.graduation_year or '',
            'target_role': self.target_role or 'Software Developer',
            'preferred_location': self.preferred_location or 'Remote / Hybrid',
            'career_interests': self.career_interests or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resume_count': len(self.resumes),
            'analysis_count': len(self.analyses)
        }
