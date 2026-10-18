from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .resume import Resume
from .analysis import Analysis
from .job import Job, SavedJob
from .roadmap import RoadmapTask
from .application import JobApplication

__all__ = ['db', 'User', 'Resume', 'Analysis', 'Job', 'SavedJob', 'RoadmapTask', 'JobApplication']
