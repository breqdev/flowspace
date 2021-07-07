from flask import current_app
from flask_jwt_extended import JWTManager

from server.model import db, User, TokenBlocklist

jwt = JWTManager()

@jwt.decode_key_loader
def decode_key_loader(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    user = User.query.filter_by(id=identity).one_or_none()
    if not user:
        return ""

    return user.password + current_app.config["JWT_SECRET_KEY"]

@jwt.encode_key_loader
def encode_key_loader(user):
    return user.password + current_app.config["JWT_SECRET_KEY"]

@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
    return (token is not None)