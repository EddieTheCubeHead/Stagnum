import base64
from typing import Callable
from unittest.mock import Mock

import httpx
import pytest
from _pytest.monkeypatch import MonkeyPatch
from fastapi import HTTPException
from sqlalchemy import select
from starlette.testclient import TestClient

from api.common.dependencies import validated_user_raw, TokenHolder
from database.database_connection import ConnectionManager
from database.entities import LoginState, User
from helpers.classes import ErrorData, SubscriptionType
from test_types.aliases import SpotifySecrets, MockResponseQueue
from test_types.callables import BaseAuthCallback, CreateValidStateString, ValidateResponse, ValidateErrorResponse, \
    MockSpotifyUserDataFetch, MockDefaultMeReturn, AuthTestCallable


@pytest.fixture
def existing_user_data(db_connection: ConnectionManager) -> User:
    user = User(spotify_id="test user", spotify_username="Old Name", spotify_avatar_url="https://old.avatar.url")
    with db_connection.session() as session:
        session.add(user)
    return user


@pytest.fixture
def existing_login(mocked_default_me_return: None, base_auth_callback_call: BaseAuthCallback) -> None:
    base_auth_callback_call()


@pytest.fixture
def auth_test(test_client: TestClient, mock_token_holder: TokenHolder) -> AuthTestCallable:
    def auth_test_wrapper(token):
        return validated_user_raw(token, mock_token_holder)

    return auth_test_wrapper


def should_return_exception_if_state_is_not_in_database_on_auth_callback(
        correct_env_variables: SpotifySecrets, test_client: TestClient, validate_error_response: ValidateErrorResponse):
    response = test_client.get(f"/auth/login/callback?state=my_invalid_state&code=12345abcde"
                               f"&client_redirect_uri=test_url")
    message = "Login state is invalid or expired. Please restart the login flow to ensure a fresh and valid state."
    validate_error_response(response, 403, message)


def should_delete_state_from_database_on_successful_login(correct_env_variables: SpotifySecrets,
                                                          base_auth_callback_call: BaseAuthCallback,
                                                          mock_token: str, db_connection: ConnectionManager,
                                                          primary_valid_state_string: str):
    base_auth_callback_call()
    with db_connection.session() as session:
        state = session.scalar(select(LoginState).where(LoginState.state_string == primary_valid_state_string))
    assert state is None


def should_return_token_from_spotify_if_state_is_valid(correct_env_variables: SpotifySecrets,
                                                       base_auth_callback_call: BaseAuthCallback,
                                                       validate_response: ValidateResponse,
                                                       mock_token: str):
    response = base_auth_callback_call()
    content = validate_response(response)
    assert content["access_token"] == f"Bearer {mock_token}"


def should_include_client_id_and_secret_from_environment_in_spotify_api_request(
        correct_env_variables: SpotifySecrets, base_auth_callback_call: BaseAuthCallback, mock_token: str,
        requests_client: Mock):
    base_auth_callback_call()
    expected_token = (base64.b64encode((correct_env_variables[0] + ':' + correct_env_variables[1]).encode('ascii'))
                      .decode('ascii'))
    call = requests_client.post.call_args
    assert call.kwargs["headers"]["Authorization"] == f"Basic {expected_token}"


def should_always_have_content_type_as_x_www_from_in_spotify_api_request(
        correct_env_variables: SpotifySecrets, base_auth_callback_call: BaseAuthCallback, mock_token: str,
        requests_client: Mock):
    base_auth_callback_call()
    call = requests_client.post.call_args
    assert call.kwargs["headers"]["Content-Type"] == "application/x-www-form-urlencoded"


def should_include_code_from_query_in_spotify_api_request(correct_env_variables: SpotifySecrets,
                                                          test_client: TestClient,
                                                          primary_valid_state_string: str, mock_token: str,
                                                          requests_client: Mock):
    expected_code = "my_auth_code"
    test_client.get(f"/auth/login/callback?state={primary_valid_state_string}"
                    f"&code={expected_code}&client_redirect_uri=test_url")
    call = requests_client.post.call_args
    assert call.kwargs["data"]["code"] == expected_code


def should_include_redirect_url_from_query_in_spotify_api_request(correct_env_variables: SpotifySecrets,
                                                                  mock_token: str,
                                                                  test_client: TestClient, requests_client: Mock,
                                                                  primary_valid_state_string: str):
    expected_url = "my_redirect_url"
    test_client.get(f"/auth/login/callback?state={primary_valid_state_string}"
                    f"&code=12345abcde&client_redirect_uri={expected_url}")
    call = requests_client.post.call_args
    assert call.kwargs["data"]["redirect_uri"] == expected_url


def should_always_have_grant_type_as_auth_code_in_spotify_api_request(
        correct_env_variables: SpotifySecrets, base_auth_callback_call: BaseAuthCallback, mock_token: str,
        requests_client: Mock):
    base_auth_callback_call()
    call = requests_client.post.call_args
    assert call.kwargs["data"]["grant_type"] == "authorization_code"


def should_get_user_data_after_token_received_and_save_it(correct_env_variables: SpotifySecrets, mock_token: str,
                                                          base_auth_callback_call: BaseAuthCallback,
                                                          requests_client: Mock, db_connection: ConnectionManager):
    base_auth_callback_call()
    call = requests_client.get.call_args
    assert call[0][0] == "https://api.spotify.com/v1/me"
    with db_connection.session() as session:
        user_data = session.scalar(select(User).where(User.spotify_id == "test user"))
    assert user_data is not None


def should_update_user_data_on_token_receive_if_it_exists(correct_env_variables: SpotifySecrets, requests_client: Mock,
                                                          base_auth_callback_call: BaseAuthCallback, mock_token: str,
                                                          existing_user_data: User, db_connection: ConnectionManager):
    base_auth_callback_call()
    call = requests_client.get.call_args
    assert call[0][0] == "https://api.spotify.com/v1/me"
    with db_connection.session() as session:
        user_data = session.scalar(select(User).where(User.spotify_id == "test user"))
    assert user_data.spotify_username == "Test User"
    assert user_data.spotify_avatar_url == "https://image.example.com"


def should_throw_exception_on_token_auth_if_not_logged_in(auth_test: AuthTestCallable):
    with pytest.raises(HTTPException) as exception_info:
        auth_test("my token")
    assert exception_info.value.status_code == 403
    assert exception_info.value.detail == "Invalid bearer token!"


def should_save_token_on_success_and_auth_with_token_afterwards(auth_test: AuthTestCallable, mock_token: str,
                                                                correct_env_variables: SpotifySecrets,
                                                                validate_response: ValidateResponse,
                                                                base_auth_callback_call: BaseAuthCallback):
    response = base_auth_callback_call()
    json_data = validate_response(response)
    actual_token = auth_test(json_data["access_token"])
    assert actual_token.session.user_token == json_data["access_token"]


def should_throw_exception_on_login_if_spotify_token_fetch_fails(correct_env_variables: SpotifySecrets,
                                                                 validate_response: ValidateResponse,
                                                                 base_auth_callback_call: BaseAuthCallback,
                                                                 requests_client: Mock,
                                                                 spotify_error_message: ErrorData):
    response = base_auth_callback_call()
    json_data = validate_response(response, 502)
    assert json_data["detail"] == (f"Error code {spotify_error_message.code} received while calling Spotify API. "
                                   f"Message: {spotify_error_message.message}")


@pytest.mark.parametrize("product_type", [SubscriptionType.Free, SubscriptionType.Open])
def should_throw_exception_on_login_if_user_has_no_premium_subscription(
        correct_env_variables: SpotifySecrets, mock_spotify_user_data_fetch: MockSpotifyUserDataFetch,
        validate_error_response: ValidateErrorResponse, base_auth_callback_call: BaseAuthCallback,
        product_type: SubscriptionType):
    mock_spotify_user_data_fetch(product=product_type.value)
    expected_error_message = "You need to have a Spotify Premium subscription to use Stagnum!"
    response = base_auth_callback_call()
    validate_error_response(response, 401, expected_error_message)


def should_be_able_to_handle_null_user_avatar(correct_env_variables: SpotifySecrets,
                                              validate_response: ValidateResponse,
                                              base_auth_callback_call: BaseAuthCallback,
                                              requests_client_get_queue: MockResponseQueue,
                                              requests_client_post_queue: MockResponseQueue,
                                              default_token_return: httpx.Response,
                                              mock_spotify_user_data_fetch: MockSpotifyUserDataFetch):
    mock_spotify_user_data_fetch(images=[])

    response = base_auth_callback_call()
    validate_response(response)


def should_allow_another_log_in_after_first_one(correct_env_variables: SpotifySecrets, existing_login: None,
                                                validate_response: ValidateResponse,
                                                base_auth_callback_call: BaseAuthCallback,
                                                create_valid_state_string: CreateValidStateString,
                                                mock_default_me_return: MockDefaultMeReturn,
                                                requests_client_post_queue: MockResponseQueue,
                                                requests_client_get_queue: MockResponseQueue):
    new_state = create_valid_state_string()
    mock_default_me_return()
    response = base_auth_callback_call(new_state)

    validate_response(response)


@pytest.mark.parametrize("environment,error_message",
                         [("development", "Could not find spotify client ID in environment variables"),
                          ("production", "Internal server error")])
def should_raise_internal_exception_if_client_id_not_present(monkeypatch: MonkeyPatch, test_client: TestClient,
                                                             validate_error_response: ValidateErrorResponse,
                                                             environment: str, error_message: str,
                                                             primary_valid_state_string: str):
    client_secret = "my_client_secret"
    monkeypatch.setenv("ENVIRONMENT", environment)
    monkeypatch.setenv("SPOTIFY_CLIENT_SECRET", client_secret)

    response = test_client.get(
        f"/auth/login/callback?state={primary_valid_state_string}&code=12345abcde&client_redirect_uri=test_url")
    validate_error_response(response, 500, error_message)


@pytest.mark.parametrize("environment,error_message",
                         [("development", "Could not find spotify client secret in environment variables"),
                          ("production", "Internal server error")])
def should_raise_internal_exception_if_client_secret_not_present(monkeypatch: MonkeyPatch, test_client: TestClient,
                                                                 error_message: str, environment: str,
                                                                 primary_valid_state_string: str,
                                                                 validate_error_response: ValidateErrorResponse):
    client_id = "my_client_id"
    monkeypatch.setenv("ENVIRONMENT", environment)
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", client_id)

    response = test_client.get(
        f"/auth/login/callback?state={primary_valid_state_string}&code=12345abcde&client_redirect_uri=test_url")
    validate_error_response(response, 500, error_message)
