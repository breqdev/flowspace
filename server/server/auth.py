import datetime

from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash

from server.model import db, User

auth = Blueprint("auth", __name__)


@auth.post("/signup")
def signup():
    name = request.form["name"]
    email = request.form["email"]
    password = request.form["password"]
    password_hash = generate_password_hash(password, method="sha256")

    user = User.query.filter_by(email=email).first()
    if user:
        return "Email Already Exists", 400

    new_user = User(
        email=email,
        name=name,
        password=password_hash,
        registered_on=datetime.datetime.now()
    )

    db.session.add(new_user)
    db.session.commit()

    auth_token = new_user.encode_auth_token(new_user.id)

    return jsonify({
        "auth_token": auth_token
    })


@auth.post("/login")
def login():
    email = request.form["email"]
    password = request.form["password"]

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return "Invalid Login", 400

    auth_token = user.encode_auth_token(user.id)

    return jsonify({
        "auth_token": auth_token
    })


def current_user():
    token = request.headers.get("Authorization").split(" ")[1]
    user = User.decode_auth_token(token)
    return user



@auth.get("/status")
def status():
    user = current_user()

    return jsonify({
        "name": user.name,
        "email": user.email,
        "registered_on": user.registered_on,
        "id": user.id
    })