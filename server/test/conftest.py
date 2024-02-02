import functools
import json
from functools import partial
from unittest.mock import AsyncMock

import pytest
from starlette.testclient import TestClient

from api.common.dependencies import SpotifyClientRaw
from database.database_connection import ConnectionManager
from api.application import application
from database.entities import EntityBase, LoginState


class DependencyHolder:
    def __init__(self, fixture):
        self._fixture = fixture

    def __call__(self):
        return self._fixture


@pytest.fixture
def spotify_client():
    return AsyncMock()


@pytest.fixture
def db_connection(tmp_path) -> ConnectionManager:
    connection = ConnectionManager(f"sqlite:///{tmp_path}/test_db", True)
    connection.init_objects(EntityBase)
    return connection


@pytest.fixture
def application_with_dependencies(spotify_client, db_connection):
    initialized_connection = db_connection
    application.dependency_overrides[SpotifyClientRaw] = DependencyHolder(spotify_client)
    application.dependency_overrides[ConnectionManager] = DependencyHolder(initialized_connection)
    return application


@pytest.fixture
def test_client(application_with_dependencies) -> TestClient:
    test_client = TestClient(application_with_dependencies)
    return test_client


@pytest.fixture
def validate_response():
    def wrapper(response, code: int = 200):
        assert response.status_code == code
        return json.loads(response.content.decode("utf-8"))
    return wrapper
