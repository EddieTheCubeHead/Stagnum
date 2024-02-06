from contextlib import contextmanager
from datetime import timedelta, datetime
import json
from unittest.mock import Mock

import pytest
from fastapi import FastAPI
from starlette.testclient import TestClient

from api.common.dependencies import SpotifyClientRaw, RequestsClientRaw
from database.database_connection import ConnectionManager
from api.application import create_app
from database.entities import EntityBase


@pytest.fixture
def application() -> FastAPI:
    return create_app()


@pytest.fixture
def requests_client():
    return Mock()


@pytest.fixture
def db_connection(tmp_path, pytestconfig) -> ConnectionManager:
    echo = "-v" in pytestconfig.invocation_params.args
    connection = ConnectionManager(f"sqlite:///{tmp_path}/test_db", echo)
    return connection


@pytest.fixture
def application_with_dependencies(application, requests_client, db_connection):
    application.dependency_overrides[RequestsClientRaw] = lambda: requests_client
    application.dependency_overrides[ConnectionManager] = lambda: db_connection
    return application


@pytest.fixture
def test_client(application_with_dependencies) -> TestClient:
    test_client = TestClient(application_with_dependencies)
    return test_client


@pytest.fixture
def validate_response():
    def wrapper(response, code: int = 200):
        assert response.status_code == code, f"Expected response with status code {code}, got {response.status_code}"
        return json.loads(response.content.decode("utf-8"))

    return wrapper
