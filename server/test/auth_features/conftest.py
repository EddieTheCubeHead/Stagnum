import json
import random
import string
from typing import Callable
from unittest.mock import Mock

import pytest
from requests import Response

from database.entities import LoginState


@pytest.fixture
def base_auth_login_call(monkeypatch, test_client):
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "test")
    return lambda: test_client.get("/auth/login?client_redirect_uri=test")


@pytest.fixture
def default_token_return(mock_token_return) -> Response:
    return mock_token_return()


@pytest.fixture
def default_me_return(request):
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
def base_auth_callback_call(correct_env_variables, test_client, primary_valid_state_string):
    def wrapper(state: str = None):
        state_string = state if state is not None else primary_valid_state_string
        return test_client.get(
            f"/auth/login/callback?state={state_string}&code=12345abcde&client_redirect_uri=test_url")

    return wrapper


@pytest.fixture
def create_valid_state_string(db_connection) -> Callable[[], str]:
    def wrapper():
        state_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
        with db_connection.session() as session:
            session.add(LoginState(state_string=state_string))
        return state_string

    return wrapper


@pytest.fixture
def primary_valid_state_string(create_valid_state_string):
    return create_valid_state_string()


@pytest.fixture
def requests_client_with_auth_mock(requests_client_post_queue, requests_client_get_queue, default_token_return,
                                   default_me_return):
    requests_client_post_queue.append(default_token_return)
    requests_client_get_queue.append(default_me_return)
    return default_token_return.content
