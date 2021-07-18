def test_index(client):
    rv = client.get("/")

    assert rv.data == b"Hello World!"