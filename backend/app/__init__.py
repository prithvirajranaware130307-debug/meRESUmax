import os
from flask import Flask
from flask_cors import CORS
from .config import Config
from .models import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for all routes under /api/*
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Ensure storage folders exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['REPORTS_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.resume import resume_bp
    from .routes.analysis import analysis_bp
    from .routes.jobs import jobs_bp
    from .routes.roadmap import roadmap_bp
    from .routes.profile import profile_bp, account_bp
    from .routes.health import health_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(roadmap_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(account_bp)
    app.register_blueprint(health_bp)

    with app.app_context():
        db.create_all()

    return app
