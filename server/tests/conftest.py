import pytest

from server import create_app
from server.model import db


@pytest.fixture
def emails(monkeypatch):
    email_list = []

    def mock_send_email(address, template, params={}):
        email_list.append({
            "address": address,
            "template": template,
            "params": params
        })

    monkeypatch.setattr("server.email.send_email", mock_send_email)

    yield email_list


@pytest.fixture
def client():
    app = create_app(database_uri="sqlite://")

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

@pytest.fixture
def user(client, emails):
    user = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "test_password"
    }

    response = client.post("/auth/signup", data=user).get_json()

    token = emails[0]["params"]["token"]

    response = client.post(f"/auth/verify?token={token}").get_json()

    token = response["access_token"]

    return user

@pytest.fixture
def token(client, user):
    rv = client.post("/auth/login", data=user).get_json()
    token = rv["access_token"]
    return token

@pytest.fixture
def headers(token):
    return {"Authorization": f"Bearer {token}"}