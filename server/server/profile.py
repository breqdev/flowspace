from flask import Blueprint, request, jsonify
from flask_jwt_extended import current_user, jwt_required

from server.model import db

profile = Blueprint("profile", __name__)


def get_profile(user):
    return jsonify({
        "name": user.name,
        "pronouns": user.pronouns or "",
        "url": user.url or "",
        "location": user.location or "",
        "bio": user.bio or ""
    })


@profile.get("/@me")
@jwt_required()
def get_own_profile():
    return get_profile(current_user)

@profile.post("/@me")
@jwt_required()
def edit_own_profile():
    current_user.name = request.json["name"]
    current_user.pronouns = request.json["pronouns"]
    current_user.url = request.json["url"]
    current_user.location = request.json["location"]
    current_user.bio = request.json["bio"]

    db.session.commit()
    return jsonify({})

