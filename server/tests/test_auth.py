def test_login(client, user):
    rv = client.post("/auth/login", data=user).get_json()
    token = rv["access_token"]

    rv = client.get(
        "/auth/status",
        headers={"Authorization": f"Bearer {token}"}
    ).get_json()

    assert rv["name"] == "Test User"

def test_not_verified(client, emails):
    user = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "test_password"
    }

    response = client.post("/auth/signup", data=user).get_json()

    response = client.post("/auth/login", data=user)
    assert response.status_code >= 400

def test_wrong_password(client, user):
    fake_user = user.copy()
    fake_user["password"] = "incorrect"

    rv = client.post("/auth/login", data=fake_user)

    assert rv.status_code >= 400


def test_invalid_email(client, user):
    fake_user = user.copy()
    fake_user["email"] = "incorrect"

    rv = client.post("/auth/login", data=fake_user)

    assert rv.status_code >= 400


def test_refresh_token(client, user):
    rv = client.post("/auth/login", data=user).get_json()
    refresh_token = rv["refresh_token"]

    rv = client.post(
        "/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"}
    ).get_json()

    new_token = rv["access_token"]

    rv = client.get(
        "/auth/status",
        headers={"Authorization": f"Bearer {new_token}"}
    ).get_json()

    assert rv["name"] == "Test User"


def test_delete_account(client, headers):
    client.post("/auth/delete", headers=headers).get_json()

    rv = client.get("/auth/status", headers=headers)

    assert rv.status_code >= 400

def test_change_email(client, user, headers, emails):
    new_user = {
        "email": "new_email@example.com",
        "password": user["password"]
    }

    # Modify the email
    client.post("/auth/email", headers=headers, data=new_user)

    # Verify the new email
    token = emails[0]["params"]["token"]

    response = client.post(
        f"/auth/verify",
        headers={"Authorization": f"Bearer {token}"}
    ).get_json()

    # Log in with new email
    rv = client.post("/auth/login", data=new_user).get_json()
    assert rv["access_token"]

    # Ensure old email cannot be used for login
    rv = client.post("/auth/login", data=user)
    assert rv.status_code >= 400

def test_change_password(client, user, headers):
    client.post(
        "/auth/password",
        data={"new_password": "password1", **user},
        headers=headers
    ).get_json()

    new_user = user.copy()
    new_user["password"] = "password1"

    # Log in with new password
    rv = client.post("/auth/login", data=new_user).get_json()
    token = rv["access_token"]
    assert token

    # Ensure old password cannot be used for login
    rv = client.post("/auth/login", data=user)
    assert rv.status_code >= 400

    # Ensure the existing token is dead
    rv = client.get("/auth/status", headers=headers)
    assert rv.status_code >= 400

    # Ensure that the new token works
    rv = client.get(
        "/auth/status", headers={"Authorization": f"Bearer {token}"})
    assert rv.status_code < 300


