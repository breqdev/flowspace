def test_signup_login(client):
    user = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "test_password"
    }

    rv = client.post("/auth/signup", data=user).get_json()

    rv = client.post("/auth/login", data=user).get_json()
    token = rv["auth_token"]

    rv = client.get(
        "/auth/status",
        headers={"Authorization": f"Bearer {token}"}
    ).get_json()

    assert rv["name"] == "Test User"