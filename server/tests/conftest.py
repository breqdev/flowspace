import os
import tempfile

import pytest

from server import create_app
from server.model import db


@pytest.fixture
def client():
    app = create_app(database_uri="sqlite://")

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
