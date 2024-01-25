import pytest
from starlette.testclient import TestClient

from database.database_connection import ConnectionManager
from api.routes import application


@pytest.fixture
def db_connection() -> ConnectionManager:
    return ConnectionManager("sqlite:///:memory:")


@pytest.fixture
def test_server():
    return TestClient(application)
