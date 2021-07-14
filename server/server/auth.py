import datetime

from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, current_user, jwt_required, get_current_user, get_jwt

from server.model import db, User
from server.cloudmanager import cloud
import server.email as email_client

auth = Blueprint("auth", __name__)


@auth.post("/signup")
def signup():
    name = request.form["name"]
    email = request.form["email"]
    password = request.form["password"]
    password_hash = generate_password_hash(password, method="sha256")

    user = User.query.filter_by(email=email).one_or_none()
    if user:
        return jsonify({"msg": "Email already exists"}), 400

    new_user = User(
        id=cloud.generate(),
        email=email,
        verified=False,
        name=name,
        password=password_hash,
        registered_on=datetime.datetime.now()
    )

    db.session.add(new_user)
    db.session.commit()

    refresh_token = create_refresh_token(identity=new_user)

    email_client.send_email(
        email,
        email_client.TEMPLATE_IDS["VERIFY_AFTER_SIGNUP"],
        {
            "name": name,
            "token": refresh_token
        }
    )

    return jsonify({"msg": "refresh token sent to email"}), 200



@auth.post("/login")
def login():
    email = request.form["email"]
    password = request.form["password"]

    user = User.query.filter_by(email=email).one_or_none()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid login"}), 400

    if not user.verified:
        refresh_token = create_refresh_token(identity=user)

        email_client.send_email(
            user.email,
            email_client.TEMPLATE_IDS["VERIFY_AFTER_LOGIN"],
            {
                "name": user.name,
                "token": refresh_token
            }
        )

        return jsonify({"msg": "Verify email first"}), 400

    access_token = create_access_token(identity=user)
    refresh_token = create_refresh_token(identity=user)

    return jsonify({
        "access_token": access_token,
        "token_type": "Bearer",
        "expiers_in": current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES").total_seconds(),
        "refresh_token": refresh_token
    })


@auth.post("/verify")
@jwt_required(refresh=True)
def verify():
    identity = get_current_user()

    identity.verified = True
    db.session.commit()

    access_token = create_access_token(identity=identity)

    return jsonify({
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES").total_seconds()
    })


@auth.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    if not current_user.verified:
        return jsonify({"msg": "User not verified"}), 400

    access_token = create_access_token(identity=current_user)

    return jsonify({
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES").total_seconds()
    })


@auth.post("/delete")
@jwt_required()
def delete():
    db.session.delete(current_user)
    db.session.commit()

    return jsonify({"msg": "Deleted user account"})

@auth.post("/email")
@jwt_required()
def modify_email():
    new_email = request.form["email"]
    password = request.form["password"]

    if not check_password_hash(current_user.password, password):
        return jsonify({"msg": "Invalid login"}), 400

    current_user.email = new_email
    current_user.verified = False
    db.session.commit()

    refresh_token = create_refresh_token(identity=current_user)

    email_client.send_email(
        new_email,
        email_client.TEMPLATE_IDS["VERIFY_AFTER_CHANGE"],
        {
            "name": current_user.name,
            "token": refresh_token
        }
    )

    return jsonify({"msg": "Changed email, please verify now"})


@auth.post("/password")
@jwt_required(optional=True)
def modify_password():
    new_password = request.form["new_password"]
    claims = get_jwt() or {}

    if not claims.get("reset_password"):
        old_password = request.form["password"]

        if not check_password_hash(current_user.password, old_password):
            return jsonify({"msg": "Invalid login"}), 400

    current_user.password = generate_password_hash(
        new_password, method="sha256")
    db.session.commit()

    return jsonify({"msg": "Password changed successfully"})


@auth.post("/reset")
def reset_password():
    email = request.form["email"]

    user = User.query.filter_by(email=email).one_or_none()

    if not user:
        return jsonify({"msg": "Account does not exist"}), 400

    if not user.verified:
        db.session.delete(user)
        db.session.commit()

        return jsonify({"msg": "User not verified, account has been deleted"}), 400

    access_token = create_access_token(
        identity=user,
        additional_claims={"reset_password": True}
    )

    email_client.send_email(
        email,
        email_client.TEMPLATE_IDS["RESET_PASSWORD"],
        {
            "name": user.name,
            "token": access_token
        }
    )

    return jsonify({"msg": "Please check email for verification link"})


@auth.get("/status")
@jwt_required()
def status():
    user = current_user

    return jsonify({
        "name": user.name,
        "email": user.email,
        "registered_on": user.registered_on,
        "id": user.id
    })