def test_get_own_profile(client, user, headers):
    response = client.get("/profile/@me", headers=headers).get_json()

    assert response["name"] == user["name"]

def test_edit_own_profile(client, user, headers):
    user = {
        "name": "New Test User"
    }

    response = client.post("/profile/@me", headers=headers, json=user).get_json()

    response = client.get("/profile/@me", headers=headers).get_json()

    assert response["name"] == user["name"]
