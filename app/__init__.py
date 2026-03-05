from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from .routes import main_bp
from .models import db

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crypto_app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    app.register_blueprint(main_bp)

    with app.app_context():
        db.create_all()

    return app