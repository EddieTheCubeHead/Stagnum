import json
import random
import string
from typing import Optional

import httpx
import pytest
from _pytest.monkeypatch import MonkeyPatch
from starlette.testclient import TestClient
from test_types.aliases import MockResponseQueue, SpotifySecrets
from test_types.callables import BaseAuthCallback, BaseAuthLogin, CreateValidStateString, MockDefaultMeReturn

from database.database_connection import ConnectionManager
from database.entities import LoginState


@pytest.fixture
def base_auth_login_call(monkeypatch: MonkeyPatch, test_client: TestClient) -> BaseAuthLogin:
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "test")

    def wrapper() -> httpx.Response:
        return test_client.get("/auth/login?client_redirect_uri=test")

    return wrapper


@pytest.fixture
def _mocked_default_me_return(mock_default_me_return: MockDefaultMeReturn) -> None:
    mock_default_me_return()


@pytest.fixture
def base_auth_callback_call(
    correct_env_variables: SpotifySecrets,  # noqa: ARG001
    test_client: TestClient,
    primary_valid_state_string: str,
) -> BaseAuthCallback:
    def wrapper(state: Optional[str] = None) -> httpx.Response:
        state_string = state if state is not None else primary_valid_state_string
        return test_client.get(
            f"/auth/login/callback?state={state_string}&code=12345abcde&client_redirect_uri=test_url"
        )

    return wrapper


@pytest.fixture
def create_valid_state_string(db_connection: ConnectionManager) -> CreateValidStateString:
    def wrapper() -> str:
        state_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
        with db_connection.session() as session:
            session.add(LoginState(state_string=state_string))
        return state_string

    return wrapper


@pytest.fixture
def primary_valid_state_string(create_valid_state_string: CreateValidStateString) -> str:
    return create_valid_state_string()


@pytest.fixture
def mocked_token(
    requests_client_post_queue: MockResponseQueue,
    requests_client_get_queue: MockResponseQueue,
    default_me_return: httpx.Response,
    default_token_return: httpx.Response,
) -> str:
    requests_client_post_queue.append(default_token_return)
    requests_client_get_queue.append(default_me_return)
    return json.loads(default_token_return.content.decode("utf-8"))["access_token"]
