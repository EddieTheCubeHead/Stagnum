import json
from asyncio import sleep
from unittest.mock import AsyncMock

import pytest
from starlette.testclient import TestClient

from api.common.dependencies import SpotifyClientRaw
from database.database_connection import ConnectionManager
from api.application import application
from database.entities import EntityBase


@pytest.fixture
def db_connection() -> ConnectionManager:
    connection_manager = ConnectionManager("sqlite:///:memory:")
    connection_manager.init_objects(EntityBase)
    return connection_manager


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
