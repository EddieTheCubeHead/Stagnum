import json
import random
import string
from unittest.mock import Mock

import httpx
import pytest
from _pytest.fixtures import FixtureRequest
from _pytest.monkeypatch import MonkeyPatch
from requests import Response
from starlette.testclient import TestClient

from database.database_connection import ConnectionManager
from database.entities import LoginState
from test_types.aliases import SpotifySecrets
from test_types.callables import CreateValidStateString, BaseAuthLogin, BaseAuthCallback, \
    MockTokenReturn


@pytest.fixture
def base_auth_login_call(monkeypatch: MonkeyPatch, test_client: TestClient) -> BaseAuthLogin:
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "test")
    def wrapper():
        return test_client.get("/auth/login?client_redirect_uri=test")
    
    return wrapper


@pytest.fixture
def default_token_return(mock_token_return: MockTokenReturn) -> httpx.Response:
    return mock_token_return()


@pytest.fixture
def default_me_return(request: FixtureRequest) -> httpx.Response:
    return_json = {
        "country": "Finland",
        "display_name": "Test User",
        "id": "test user",
        "images": [
            {
                "url": "https://image.example.com",
                "height": 300,
                "width": 300
            }
        ],
        "product": request.param.value if hasattr(request, "param") else "premium"
    }
    response = Mock()
    response.status_code = 200
    response.content = json.dumps(return_json).encode("utf-8")
    return response


@pytest.fixture
def base_auth_callback_call(correct_env_variables: SpotifySecrets, test_client: TestClient, 
                            primary_valid_state_string: str) -> BaseAuthCallback:
    def wrapper(state: str = None):
        state_string = state if state is not None else primary_valid_state_string
        return test_client.get(
            f"/auth/login/callback?state={state_string}&code=12345abcde&client_redirect_uri=test_url")

    return wrapper


@pytest.fixture
def create_valid_state_string(db_connection: ConnectionManager) -> CreateValidStateString:
    def wrapper():
        state_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
        with db_connection.session() as session:
            session.add(LoginState(state_string=state_string))
        return state_string

    return wrapper


@pytest.fixture
def primary_valid_state_string(create_valid_state_string: CreateValidStateString) -> str:
    return create_valid_state_string()


@pytest.fixture
def mock_token(requests_client_post_queue: list[Response], requests_client_get_queue: list[Response],
               default_me_return: httpx.Response, default_token_return: httpx.Response) -> str:
    requests_client_post_queue.append(default_token_return)
    requests_client_get_queue.append(default_me_return)
    return json.loads(default_token_return.content.decode("utf-8"))["access_token"]
