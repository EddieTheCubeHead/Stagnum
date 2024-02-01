import json
from asyncio import sleep
from unittest.mock import AsyncMock

import pytest
from starlette.testclient import TestClient

from api.common.dependencies import SpotifyClientRaw
from database.database_connection import ConnectionManager
from api.application import application


@pytest.fixture
def db_connection() -> ConnectionManager:
    return ConnectionManager("sqlite:///:memory:")


@pytest.fixture
def spotify_client():
    return AsyncMock()


@pytest.fixture
def spotify_client_dependency(spotify_client):
    def wrapper():
        return spotify_client
    return wrapper


@pytest.fixture
def test_server(spotify_client_dependency):
    test_client = TestClient(application)
    application.dependency_overrides.update({SpotifyClientRaw: spotify_client_dependency})
    return test_client


@pytest.fixture
def validate_response():
    def wrapper(response, code: int = 200):
        assert response.status_code == code
        return json.loads(response.content.decode("utf-8"))
    return wrapper
