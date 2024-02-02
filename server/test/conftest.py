import json
from asyncio import sleep
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
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
    # We have to do this wrapper - hackery because of how pytest fixtures interact with FastAPI dependencies:
    # pytest fixtures are called on insert, while FastAPI dependency overrides are callables. Thus, we need to return
    # a callable (wrapper).
    #
    # The reason we don't return AsyncMock straight from here is to enable us to use the spotify_client fixture
    # elsewhere. Because pytest caches fixtures within scope (default: test), we can set mock values on the fixture
    # inside other tests and fixtures. This way we don't need to set all necessary return values here.
    def wrapper():
        return spotify_client
    return wrapper


@pytest.fixture
def insert_dependencies(spotify_client_dependency):
    def wrapper(application_to_mock: FastAPI):
        application_to_mock.dependency_overrides.update({SpotifyClientRaw: spotify_client_dependency})
    return wrapper


@pytest.fixture
def test_client(insert_dependencies) -> TestClient:
    test_client = TestClient(application)
    insert_dependencies(application)
    return test_client


@pytest.fixture
def validate_response():
    def wrapper(response, code: int = 200):
        assert response.status_code == code
        return json.loads(response.content.decode("utf-8"))
    return wrapper
