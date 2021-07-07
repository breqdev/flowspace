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
    fields = ["name", "pronouns", "url", "location", "bio"]

    for field in fields:
        if field in request.json:
            setattr(current_user, field, request.json[field])

    db.session.commit()
    return jsonify({})

