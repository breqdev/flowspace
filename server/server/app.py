import os

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv


load_dotenv()

def create_app(database_uri=None):
    app = Flask(__name__)
    CORS(app, resources={"/*": {"origins": "*"}})

    if database_uri is None:
        database_uri = os.environ["SQLALCHEMY_DATABASE_URI"]

    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "test")

    from server.model import db
    db.init_app(app)

    from server.auth import auth
    app.register_blueprint(auth, url_prefix="/auth")

    @app.get("/")
    def index():
        return "Hello World!"

    return app