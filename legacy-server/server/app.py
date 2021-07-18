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

    from server.cloudmanager import cloud
    cloud.init_app(app)

    if database_uri is None:
        database_uri = (
            os.getenv("SQLALCHEMY_DATABASE_URI")  # used in development
            or os.getenv("DATABASE_URL").replace('postgres://', 'postgresql://')  # used for Dokku deploy
        )

    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY", "test")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=1)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = datetime.timedelta(days=30)
    app.config["JWT_QUERY_STRING_NAME"] = "token"

    app.config["SNOWCLOUD_URL"] = "https://snowcloud.breq.dev/"
    app.config["SNOWCLOUD_KEY"] = os.getenv("SNOWCLOUD_KEY")

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