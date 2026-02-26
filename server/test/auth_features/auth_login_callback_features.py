import base64
from unittest.mock import Mock

import pytest
from _pytest.monkeypatch import MonkeyPatch
from fastapi import HTTPException
from sqlalchemy import select
from starlette import status
from starlette.testclient import TestClient

from api.common.dependencies import TokenHolder, validated_user_raw
from database.database_connection import ConnectionManager
from database.entities import LoginState, User
from helpers.classes import ErrorData, SubscriptionType
from test_types.aliases import SpotifySecrets
from test_types.callables import (
    AuthTestCallable,
    BaseAuthCallback,
    CreateValidStateString,
    MockDefaultMeReturn,
    MockSpotifyUserDataFetch,
    ValidateErrorResponse,
    ValidateResponse,
)


@pytest.fixture
def existing_user_data(db_connection: ConnectionManager) -> User:
    user = User(spotify_id="test user", spotify_username="Old Name", spotify_avatar_url="https://old.avatar.url")
    with db_connection.session() as session:
        session.add(user)
    return user


@pytest.fixture
def _existing_login(_mocked_default_me_return: None, base_auth_callback_call: BaseAuthCallback) -> None:
    base_auth_callback_call()


@pytest.fixture
def auth_test(mock_token_holder: TokenHolder) -> AuthTestCallable:
    def wrapper(token: str) -> User:
        return validated_user_raw(token, mock_token_holder)

    return wrapper


@pytest.mark.usefixtures("correct_env_variables")
def should_return_exception_if_state_is_not_in_database_on_auth_callback(
    test_client: TestClient, validate_error_response: ValidateErrorResponse
) -> None:
    response = test_client.get(
        "/auth/login/callback?state=my_invalid_state&code=12345abcde&client_redirect_uri=test_url"
    )
    message = "Login state is invalid or expired. Please restart the login flow to ensure a fresh and valid state."
    validate_error_response(response, 403, message)


@pytest.mark.usefixtures("correct_env_variables", "mocked_token")
def should_delete_state_from_database_on_successful_login(
    base_auth_callback_call: BaseAuthCallback, db_connection: ConnectionManager, primary_valid_state_string: str
) -> None:
    base_auth_callback_call()
    with db_connection.session() as session:
        state = session.scalar(select(LoginState).where(LoginState.state_string == primary_valid_state_string))
    assert state is None


@pytest.mark.usefixtures("correct_env_variables")
def should_return_token_from_spotify_if_state_is_valid(
    base_auth_callback_call: BaseAuthCallback, validate_response: ValidateResponse, mocked_token: str
) -> None:
    response = base_auth_callback_call()
    content = validate_response(response)
    assert content["access_token"] == f"Bearer {mocked_token}"


@pytest.mark.usefixtures("mocked_token")
def should_include_client_id_and_secret_from_environment_in_spotify_api_request(
    correct_env_variables: SpotifySecrets, base_auth_callback_call: BaseAuthCallback, requests_client: Mock
) -> None:
    base_auth_callback_call()
    expected_token = base64.b64encode(
        (correct_env_variables[0] + ":" + correct_env_variables[1]).encode("ascii")
    ).decode("ascii")
    call = requests_client.post.call_args
    assert call.kwargs["headers"]["Authorization"] == f"Basic {expected_token}"


@pytest.mark.usefixtures("correct_env_variables", "mocked_token")
def should_always_have_content_type_as_x_www_from_in_spotify_api_request(
    base_auth_callback_call: BaseAuthCallback, requests_client: Mock
) -> None:
    base_auth_callback_call()
    call = requests_client.post.call_args
    assert call.kwargs["headers"]["Content-Type"] == "application/x-www-form-urlencoded"


@pytest.mark.usefixtures("correct_env_variables", "mocked_token")
def should_include_code_from_query_in_spotify_api_request(
    test_client: TestClient, primary_valid_state_string: str, requests_client: Mock
) -> None:
    expected_code = "my_auth_code"
    test_client.get(
        f"/auth/login/callback?state={primary_valid_state_string}&code={expected_code}&client_redirect_uri=test_url"
    )
    call = requests_client.post.call_args
    assert call.kwargs["data"]["code"] == expected_code


@pytest.mark.usefixtures("correct_env_variables", "mocked_token")
def should_include_redirect_url_from_query_in_spotify_api_request(
    test_client: TestClient, requests_client: Mock, primary_valid_state_string: str
) -> None:
    expected_url = "my_redirect_url"
    test_client.get(
        f"/auth/login/callback?state={primary_valid_state_string}&code=12345abcde&client_redirect_uri={expected_url}"
    )
    call = requests_client.post.call_args
    assert call.kwargs["data"]["redirect_uri"] == expected_url


@pytest.mark.usefixtures("correct_env_variables", "mocked_token")
def should_always_have_grant_type_as_auth_code_in_spotify_api_request(
    base_auth_callback_call: BaseAuthCallback, requests_client: Mock
) -> None:
    base_auth_callback_call()
    call = requests_client.post.call_args
    assert call.kwargs["data"]["grant_type"] == "authorization_code"


@pytest.mark.usefixtures("correct_env_variables", "mocked_token")
def should_get_user_data_after_token_received_and_save_it(
    base_auth_callback_call: BaseAuthCallback, requests_client: Mock, db_connection: ConnectionManager
) -> None:
    base_auth_callback_call()
    call = requests_client.get.call_args
    assert call[0][0] == "https://api.spotify.com/v1/me"
    with db_connection.session() as session:
        user_data = session.scalar(select(User).where(User.spotify_id == "test user"))
    assert user_data is not None


@pytest.mark.usefixtures("correct_env_variables", "mocked_token", "existing_user_data")
def should_update_user_data_on_token_receive_if_it_exists(
    requests_client: Mock, base_auth_callback_call: BaseAuthCallback, db_connection: ConnectionManager
) -> None:
    base_auth_callback_call()
    call = requests_client.get.call_args
    assert call[0][0] == "https://api.spotify.com/v1/me"
    with db_connection.session() as session:
        user_data = session.scalar(select(User).where(User.spotify_id == "test user"))
    assert user_data.spotify_username == "Test User"
    assert user_data.spotify_avatar_url == "https://image.example.com"


def should_throw_exception_on_token_auth_if_not_logged_in(auth_test: AuthTestCallable) -> None:
    with pytest.raises(HTTPException) as exception_info:
        auth_test("my token")
    assert exception_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert exception_info.value.detail == "Invalid bearer token!"


@pytest.mark.usefixtures("correct_env_variables", "mocked_token")
def should_save_token_on_success_and_auth_with_token_afterwards(
    auth_test: AuthTestCallable, validate_response: ValidateResponse, base_auth_callback_call: BaseAuthCallback
) -> None:
    response = base_auth_callback_call()
    json_data = validate_response(response)
    actual_token = auth_test(json_data["access_token"])
    assert actual_token.session.user_token == json_data["access_token"]


@pytest.mark.usefixtures("correct_env_variables")
def should_throw_exception_on_login_if_spotify_token_fetch_fails(
    validate_spotify_error_response: ValidateErrorResponse,
    base_auth_callback_call: BaseAuthCallback,
    spotify_error_message: ErrorData,
) -> None:
    response = base_auth_callback_call()
    validate_spotify_error_response(response, spotify_error_message.code, spotify_error_message.message)


@pytest.mark.usefixtures("correct_env_variables")
@pytest.mark.parametrize("product_type", (SubscriptionType.Free, SubscriptionType.Open))
def should_throw_exception_on_login_if_user_has_no_premium_subscription(
    mock_spotify_user_data_fetch: MockSpotifyUserDataFetch,
    validate_error_response: ValidateErrorResponse,
    base_auth_callback_call: BaseAuthCallback,
    product_type: SubscriptionType,
) -> None:
    mock_spotify_user_data_fetch(product=product_type.value)
    expected_error_message = "You need to have a Spotify Premium subscription to use Stagnum!"
    response = base_auth_callback_call()
    validate_error_response(response, 401, expected_error_message)


@pytest.mark.usefixtures("correct_env_variables")
def should_be_able_to_handle_null_user_avatar(
    validate_response: ValidateResponse,
    base_auth_callback_call: BaseAuthCallback,
    mock_spotify_user_data_fetch: MockSpotifyUserDataFetch,
) -> None:
    mock_spotify_user_data_fetch(images=[])

    response = base_auth_callback_call()
    validate_response(response)


@pytest.mark.usefixtures("correct_env_variables", "_existing_login")
def should_allow_another_log_in_after_first_one(
    validate_response: ValidateResponse,
    base_auth_callback_call: BaseAuthCallback,
    create_valid_state_string: CreateValidStateString,
    mock_default_me_return: MockDefaultMeReturn,
) -> None:
    new_state = create_valid_state_string()
    mock_default_me_return()
    response = base_auth_callback_call(new_state)

    validate_response(response)


@pytest.mark.parametrize(
    ("environment", "error_message"),
    (
        ("development", "Could not find spotify client ID in environment variables"),
        ("production", "Internal server error"),
    ),
)
def should_raise_internal_exception_if_client_id_not_present(
    monkeypatch: MonkeyPatch,
    test_client: TestClient,
    validate_error_response: ValidateErrorResponse,
    environment: str,
    error_message: str,
    primary_valid_state_string: str,
) -> None:
    client_secret = "my_client_secret"
    monkeypatch.setenv("ENVIRONMENT", environment)
    monkeypatch.setenv("SPOTIFY_CLIENT_SECRET", client_secret)

    response = test_client.get(
        f"/auth/login/callback?state={primary_valid_state_string}&code=12345abcde&client_redirect_uri=test_url"
    )
    validate_error_response(response, 500, error_message)


@pytest.mark.parametrize(
    ("environment", "error_message"),
    (
        ("development", "Could not find spotify client secret in environment variables"),
        ("production", "Internal server error"),
    ),
)
def should_raise_internal_exception_if_client_secret_not_present(
    monkeypatch: MonkeyPatch,
    test_client: TestClient,
    error_message: str,
    environment: str,
    primary_valid_state_string: str,
    validate_error_response: ValidateErrorResponse,
) -> None:
    client_id = "my_client_id"
    monkeypatch.setenv("ENVIRONMENT", environment)
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", client_id)

    response = test_client.get(
        f"/auth/login/callback?state={primary_valid_state_string}&code=12345abcde&client_redirect_uri=test_url"
    )
    validate_error_response(response, 500, error_message)
