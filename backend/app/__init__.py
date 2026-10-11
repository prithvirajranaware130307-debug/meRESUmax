import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from .config import Config
from .models import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS safely
    cors_origins = [o.strip() for o in app.config.get('CORS_ORIGINS', '*').split(',') if o.strip()]
    if not cors_origins or '*' in cors_origins:
        CORS(
            app, 
            resources={r"/api/*": {"origins": "*"}}, 
            methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
        )
    else:
        CORS(
            app, 
            resources={r"/api/*": {"origins": cors_origins}}, 
            supports_credentials=True, 
            methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
        )

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

    # Friendly root and error handlers
    @app.route('/')
    def root():
        return jsonify({
            'platform': 'meRESUmax Platform API',
            'version': '1.0.0',
            'status': 'online',
            'health_check': '/api/health'
        }), 200

    @app.errorhandler(413)
    def request_entity_too_large(e):
        return jsonify({'error': 'File is too large. Maximum allowed file size is 16 MB.'}), 413

    @app.errorhandler(404)
    def resource_not_found(e):
        if request.path.startswith('/api/'):
            return jsonify({'error': f'Endpoint not found: {request.path}'}), 404
        return jsonify({
            'platform': 'meRESUmax Platform API',
            'message': 'API is running. Access API endpoints under /api/* or check /api/health'
        }), 200

    with app.app_context():
        db.create_all()

    return app
