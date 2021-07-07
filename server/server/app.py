import os
import datetime

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv


load_dotenv()

def create_app(database_uri=None):
    app = Flask(__name__)
    CORS(app, resources={"/*": {"origins": "*"}}, max_age=datetime.timedelta(days=30))

    from server.jwtmanager import jwt
    jwt.init_app(app)

    if database_uri is None:
        database_uri = os.environ["SQLALCHEMY_DATABASE_URI"]

    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY", "test")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=1)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = datetime.timedelta(days=30)
    app.config["JWT_QUERY_STRING_NAME"] = "token"

    from server.model import db, migrate
    db.init_app(app)
    migrate.init_app(app)

    from server.auth import auth
    app.register_blueprint(auth, url_prefix="/auth")

    from server.profile import profile
    app.register_blueprint(profile, url_prefix="/profile")

    @app.get("/")
    def index():
        return "Hello World!"

    return app