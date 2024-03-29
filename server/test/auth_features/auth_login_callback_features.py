import base64
import json
import random
import string
from enum import Enum
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from sqlalchemy import select

from api.common.dependencies import validated_user_raw
from database.entities import LoginState, User


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
                                   f"&code=12345abcde&client_redirect_uri=test_url")


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
    response.status_code = 200
    response.content = json.dumps(return_json).encode("utf-8")
    return response


class SubscriptionType(Enum):
    Premium = "premium"
    Open = "open"
    Free = "free"


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
def requests_client_with_auth_mock(requests_client, default_token_return, default_me_return):
    requests_client.post = Mock(return_value=default_token_return)
    requests_client.get = Mock(return_value=default_me_return)
    return default_token_return.content


@pytest.fixture
def auth_test(test_client, mock_token_holder):

    def auth_test_wrapper(token):
        return validated_user_raw(token, mock_token_holder)

    return auth_test_wrapper


def should_return_exception_if_state_is_not_in_database_on_auth_callback(correct_env_variables, test_client,
                                                                         validate_response):
    response = test_client.get(f"/auth/login/callback?state=my_invalid_state&code=12345abcde"
                               f"&client_redirect_uri=test_url")
    exception = validate_response(response, 403)
    assert exception["detail"] == "Login state is invalid or expired"


def should_delete_state_from_database_on_successful_login(correct_env_variables, base_auth_callback_call,
                                                          requests_client_with_auth_mock, db_connection,
                                                          valid_state_string):
    base_auth_callback_call()
    with db_connection.session() as session:
        state = session.scalar(select(LoginState).where(LoginState.state_string == valid_state_string))
    assert state is None


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
                    f"&code={expected_code}&client_redirect_uri=test_url")
    call = requests_client.post.call_args
    assert call.kwargs["data"]["code"] == expected_code


def should_include_redirect_url_from_query_in_spotify_api_request(correct_env_variables, test_client,
                                                                  valid_state_string, requests_client_with_auth_mock,
                                                                  requests_client):
    expected_url = "my_redirect_url"
    test_client.get(f"/auth/login/callback?state={valid_state_string}"
                    f"&code=12345abcde&client_redirect_uri={expected_url}")
    call = requests_client.post.call_args
    assert call.kwargs["data"]["redirect_uri"] == expected_url


def should_always_have_grant_type_as_auth_code_in_spotify_api_request(correct_env_variables, base_auth_callback_call,
                                                                      requests_client_with_auth_mock, requests_client):
    base_auth_callback_call()
    call = requests_client.post.call_args
    assert call.kwargs["data"]["grant_type"] == "authorization_code"


def should_get_user_data_after_token_received_and_save_it(correct_env_variables, base_auth_callback_call,
                                                          requests_client_with_auth_mock, requests_client,
                                                          db_connection):
    base_auth_callback_call()
    call = requests_client.get.call_args
    assert call[0][0] == "https://api.spotify.com/v1/me"
    with db_connection.session() as session:
        user_data = session.scalar(select(User).where(User.spotify_id == "test user"))
    assert user_data is not None


def should_update_user_data_on_token_receive_if_it_exists(correct_env_variables, base_auth_callback_call,
                                                          requests_client_with_auth_mock, requests_client,
                                                          db_connection):
    with db_connection.session() as session:
        session.add(User(spotify_id="test user", spotify_username="Old Name",
                         spotify_avatar_url="https://old.avatar.url"))
    base_auth_callback_call()
    call = requests_client.get.call_args
    assert call[0][0] == "https://api.spotify.com/v1/me"
    with db_connection.session() as session:
        user_data = session.scalar(select(User).where(User.spotify_id == "test user"))
    assert user_data.spotify_username == "Test User"
    assert user_data.spotify_avatar_url == "https://image.example.com"


def should_throw_exception_on_token_auth_if_not_logged_in(auth_test):
    with pytest.raises(HTTPException) as exception_info:
        auth_test("my token")
    assert exception_info.value.status_code == 403
    assert exception_info.value.detail == "Invalid bearer token!"


def should_save_token_on_success_and_auth_with_token_afterwards(auth_test, correct_env_variables, validate_response,
                                                                base_auth_callback_call,
                                                                requests_client_with_auth_mock):
    response = base_auth_callback_call()
    json_data = validate_response(response)
    actual_token = auth_test(json_data["access_token"])
    assert actual_token.session.user_token == json_data["access_token"]


@pytest.mark.parametrize("code", [401, 403, 404, 500])
def should_throw_exception_on_login_if_spotify_token_fetch_fails(correct_env_variables, validate_response,
                                                                 base_auth_callback_call, requests_client,
                                                                 requests_client_with_auth_mock, code):
    requests_client.post.return_value.status_code = code
    expected_error_message = "my error message"
    requests_client.post.return_value.content = json.dumps({"error": expected_error_message}).encode("utf-8")
    response = base_auth_callback_call()
    json_data = validate_response(response, code)
    assert json_data["detail"] == expected_error_message


@pytest.mark.parametrize("default_me_return", [SubscriptionType.Free, SubscriptionType.Open], indirect=True)
def should_throw_exception_on_login_if_user_has_no_premium_subscription(correct_env_variables, default_me_return,
                                                                        validate_response, base_auth_callback_call,
                                                                        requests_client_with_auth_mock):
    expected_error_message = "You need to have a Spotify Premium subscription to use Stagnum!"
    response = base_auth_callback_call()
    json_data = validate_response(response, 401)
    assert json_data["detail"] == expected_error_message


def should_be_able_to_handle_null_user_avatar(correct_env_variables, validate_response, base_auth_callback_call,
                                              requests_client, default_token_return):
    return_json = {
        "country": "Finland",
        "display_name": "Test User",
        "id": "test user",
        "images": [],
        "product": "premium"
    }
    response = Mock()
    response.status_code = 200
    response.content = json.dumps(return_json).encode("utf-8")
    requests_client.post = Mock(return_value=default_token_return)
    requests_client.get = Mock(return_value=response)

    response = base_auth_callback_call()
    validate_response(response)
