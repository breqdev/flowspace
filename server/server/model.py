import datetime

from flask import current_app
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate(db=db)


class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(), nullable=False)
    revoked_at = db.Column(db.DateTime, nullable=False)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Registration Data
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    registered_on = db.Column(db.DateTime, nullable=False)

    # User Profile
    name = db.Column(db.String, nullable=False)
    pronouns = db.Column(db.String)
    url = db.Column(db.String)
    location = db.Column(db.String)
    bio = db.Column(db.Text)


    def __repr__(self):
        return f"<User {self.id}>"


if __name__ == "__main__":
    from server.app import create_app
    with create_app().app_context():
        db.create_all()