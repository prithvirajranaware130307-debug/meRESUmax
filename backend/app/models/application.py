from datetime import datetime
from . import db

class JobApplication(db.Model):
    __tablename__ = 'job_applications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete='SET NULL'), nullable=True, index=True)

    company = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), default='Remote')
    job_type = db.Column(db.String(50), default='Full-time')  # Full-time, Contract, Internship, Part-time
    status = db.Column(db.String(50), default='saved', index=True)  # saved, applied, interviewing, offer, rejected
    priority = db.Column(db.String(20), default='medium')  # high, medium, low
    salary_range = db.Column(db.String(100), default='')
    url = db.Column(db.String(500), default='')
    
    contact_name = db.Column(db.String(150), default='')
    contact_email = db.Column(db.String(150), default='')
    notes = db.Column(db.Text, default='')
    next_step = db.Column(db.String(255), default='')

    applied_date = db.Column(db.DateTime, nullable=True)
    interview_date = db.Column(db.DateTime, nullable=True)
    deadline = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = db.relationship('Job')

    def to_dict(self):
        days_since_applied = None
        if self.applied_date:
            days_since_applied = max(0, (datetime.utcnow() - self.applied_date).days)

        is_interview_upcoming = False
        if self.interview_date:
            is_interview_upcoming = self.interview_date >= datetime.utcnow()

        return {
            'id': self.id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'company': self.company,
            'role': self.role,
            'location': self.location,
            'job_type': self.job_type,
            'status': self.status,
            'priority': self.priority,
            'salary_range': self.salary_range,
            'url': self.url,
            'contact_name': self.contact_name,
            'contact_email': self.contact_email,
            'notes': self.notes,
            'next_step': self.next_step,
            'applied_date': self.applied_date.isoformat() if self.applied_date else None,
            'interview_date': self.interview_date.isoformat() if self.interview_date else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'days_since_applied': days_since_applied,
            'is_interview_upcoming': is_interview_upcoming,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'job': self.job.to_dict() if self.job else None
        }
