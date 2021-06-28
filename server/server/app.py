import os

from flask import Flask
from dotenv import load_dotenv


load_dotenv()

def create_app(database_uri=None):
    app = Flask(__name__)

    if database_uri is None:
        database_uri = os.environ["SQLALCHEMY_DATABASE_URI"]

    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    from server.model import db
    db.init_app(app)

    @app.route("/")
    def index():
        return "Hello World!"

    return app