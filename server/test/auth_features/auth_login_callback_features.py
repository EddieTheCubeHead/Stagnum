import base64
import json
import string
import random
from unittest.mock import MagicMock, Mock

import pytest

from database.entities import LoginState


@pytest.fixture
def correct_env_variables(monkeypatch):
    client_id = "my_client_id"
    client_secret = "my_client_secret"
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", client_id)
    monkeypatch.setenv("SPOTIFY_CLIENT_SECRET", client_secret)
    return client_id, client_secret


@pytest.fixture
def base_auth_callback_call(correct_env_variables, test_client, valid_state_string):
    return lambda: test_client.get(f"/auth/login/callback?state={valid_state_string}"
                                   f"&code=12345abcde&redirect_uri=test_uri")


@pytest.fixture
def valid_state_string(db_connection):
    state_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
    with db_connection.session() as session:
        session.add(LoginState(state_string=state_string))
    return state_string


@pytest.fixture
def default_token_return():
    return_json = {
        "access_token": "my access token",
        "token_type": "Bearer",
        "scopes": "ignored here",
        "expires_in": 800,
        "refresh_token": "my refresh token"
    }
    response = Mock()
    response.code = 200
    response.content = json.dumps(return_json).encode("utf-8")
    return response


@pytest.fixture
def default_me_return():
    return_json = {
        "country": "Finland",
        "display_name": "Test User",
        "email": "test.user@example.test",
        "images": [
            {
                "url": "https://image.example.com",
                "height": 300,
                "width": 300
            }
        ]
    }
    response = Mock()
    response.code = 200
    response.content = json.dumps(return_json).encode("utf-8")
    return response


@pytest.fixture
def requests_client_with_auth_mock(requests_client, default_token_return, default_me_return):
    requests_client.post = Mock(return_value=default_token_return)
    requests_client.get = Mock(return_value=default_me_return)
    return default_token_return.content


def should_return_exception_if_state_is_not_in_database_on_auth_callback(correct_env_variables, test_client,
                                                                         validate_response):
    response = test_client.get(f"/auth/login/callback?state=my_invalid_state&code=12345abcde&redirect_uri=test_uri")
    exception = validate_response(response, 403)
    assert exception["detail"] == "Login state is invalid or expired"


def should_return_token_from_spotify_if_state_is_valid(correct_env_variables, base_auth_callback_call,
                                                       validate_response, requests_client_with_auth_mock):
    response = base_auth_callback_call()
    content = validate_response(response)
    expected_access_token = json.loads(requests_client_with_auth_mock.decode("utf-8"))["access_token"]
    assert content["access_token"] == f"Bearer {expected_access_token}"


def should_include_client_id_and_secret_from_environment_in_spotify_api_request(correct_env_variables,
                                                                                base_auth_callback_call,
                                                                                requests_client_with_auth_mock,
                                                                                requests_client):
    base_auth_callback_call()
    expected_token = (base64.b64encode((correct_env_variables[0] + ':' + correct_env_variables[1]).encode('ascii'))
                      .decode('ascii'))
    call = requests_client.post.call_args
    assert call.kwargs["headers"]["Authorization"] == f"Basic {expected_token}"


def should_always_have_content_type_as_x_www_from_in_spotify_api_request(correct_env_variables,
                                                                         base_auth_callback_call,
                                                                         requests_client_with_auth_mock,
                                                                         requests_client):
    base_auth_callback_call()
    call = requests_client.post.call_args
    assert call.kwargs["headers"]["Content-Type"] == "application/x-www-form-urlencoded"


def should_include_code_from_query_in_spotify_api_request(correct_env_variables, test_client, valid_state_string,
                                                          requests_client_with_auth_mock, requests_client):
    expected_code = "my_auth_code"
    test_client.get(f"/auth/login/callback?state={valid_state_string}"
                    f"&code={expected_code}&redirect_uri=test_uri")
    call = requests_client.post.call_args
    assert call.kwargs["data"]["code"] == expected_code


def should_include_redirect_uri_from_query_in_spotify_api_request(correct_env_variables, test_client,
                                                                  valid_state_string, requests_client_with_auth_mock,
                                                                  requests_client):
    expected_uri = "my_redirect_uri"
    test_client.get(f"/auth/login/callback?state={valid_state_string}"
                    f"&code=12345abcde&redirect_uri={expected_uri}")
    call = requests_client.post.call_args
    assert call.kwargs["data"]["redirect_uri"] == expected_uri


def should_always_have_grant_type_as_auth_code_in_spotify_api_request(correct_env_variables, base_auth_callback_call,
                                                                      requests_client_with_auth_mock, requests_client):
    base_auth_callback_call()
    call = requests_client.post.call_args
    assert call.kwargs["data"]["grant_type"] == "authorization_code"


def should_get_user_data_after_token_received_and_save_it(correct_env_variables, base_auth_callback_call,
                                                          requests_client_with_auth_mock, requests_client):
    base_auth_callback_call()
    call = requests_client.get.call_args
    pass
