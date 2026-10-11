from datetime import datetime
import json
from . import db

class Resume(db.Model):
    __tablename__ = 'resumes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(20), nullable=False)  # pdf, docx
    file_size = db.Column(db.Integer, nullable=False)
    
    extracted_text = db.Column(db.Text, nullable=False)
    _parsed_data = db.Column('parsed_data', db.Text, default='{}')
    
    status = db.Column(db.String(30), default='parsed')  # parsed, analyzing, error
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    analyses = db.relationship('Analysis', backref='resume', cascade='all, delete-orphan', lazy=True)

    @property
    def parsed_data(self):
        try:
            return json.loads(self._parsed_data or '{}')
        except Exception:
            return {}

    @parsed_data.setter
    def parsed_data(self, value):
        self._parsed_data = json.dumps(value)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'status': self.status,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'parsed_data': self.parsed_data
        }
