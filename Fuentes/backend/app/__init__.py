from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    app.config.from_object(config_class)
    
    from app.models import tbldifficulty, tbltemplate, tblplayed

    db.init_app(app)

    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app