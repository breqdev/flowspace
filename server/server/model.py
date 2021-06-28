import datetime

import jwt

from flask import current_app
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Registration Data
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    registered_on = db.Column(db.DateTime, nullable=False)

    # User Profile
    name = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f"<User {self.id}>"

    @staticmethod
    def encode_auth_token(user_id):
        now = datetime.datetime.utcnow()
        payload = {
            "exp": now + datetime.timedelta(days=1),
            "iat": now,
            "sub": user_id
        }

        return jwt.encode(payload, current_app.config.get("SECRET_KEY"))

    @staticmethod
    def decode_auth_token(auth_token):
        payload = jwt.decode(
            auth_token,
            current_app.config.get("SECRET_KEY"),
            algorithms=["HS256"]
        )
        return User.query.filter_by(id=payload["sub"]).first()
