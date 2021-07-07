def test_login(client, user):
    rv = client.post("/auth/login", data=user).get_json()
    token = rv["access_token"]

    rv = client.get(
        "/auth/status",
        headers={"Authorization": f"Bearer {token}"}
    ).get_json()

    assert rv["name"] == "Test User"


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


def test_revoked_token(client, user):
    rv = client.post("/auth/login", data=user).get_json()
    token = rv["access_token"]

    rv = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})

    rv = client.get(
        "/auth/status",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert rv.status_code >= 400


def test_delete_account(client, headers):
    client.post("/auth/delete", headers=headers).get_json()

    rv = client.get("/auth/status", headers=headers)

    assert rv.status_code >= 400