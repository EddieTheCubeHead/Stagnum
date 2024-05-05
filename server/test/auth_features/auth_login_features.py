import re

import pytest
from _pytest.monkeypatch import MonkeyPatch
from sqlalchemy import select
from starlette.testclient import TestClient

from api.common.dependencies import DatabaseConnection
from database.entities import LoginState
from test_types.callables import BaseAuthLogin, ValidateResponse, GetQueryParameter


@pytest.fixture
def required_headers() -> list[str]:
    return [
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-private",
        "user-read-email"
    ]


def should_have_required_scopes_in_login_redirect_response(base_auth_login_call: BaseAuthLogin,
                                                           validate_response:  ValidateResponse,
                                                           required_headers: list[str],
                                                           get_query_parameter: GetQueryParameter):
    response = base_auth_login_call()
    data_json = validate_response(response)
    scopes_strings = get_query_parameter(data_json["redirect_uri"], "scope").split(" ")
    for header in required_headers:
        assert header in scopes_strings


def should_have_sixteen_bytes_of_noise_as_state_in_login_redirect_response(
        base_auth_login_call: BaseAuthLogin, validate_response: ValidateResponse,
        get_query_parameter: GetQueryParameter):
    response = base_auth_login_call()
    data_json = validate_response(response)
    state_string = get_query_parameter(data_json["redirect_uri"], "state")
    assert re.match(r"\w{16}", state_string), (f"State string '{state_string}' does not consist of sixteen "
                                               f"digits or letters")


def should_have_random_state_in_login_redirect_response(base_auth_login_call: BaseAuthLogin,
                                                        validate_response: ValidateResponse,
                                                        get_query_parameter: GetQueryParameter):
    responses = [base_auth_login_call() for _ in range(10)]
    response_contents = [validate_response(response) for response in responses]
    state_strings = [get_query_parameter(data["redirect_uri"], "state") for data in response_contents]
    assert len(set(state_strings)) == 10, f"Did not find 10 unique strings in collection '{state_strings}'"


def should_have_response_type_as_code_in_login_redirect_response(base_auth_login_call: BaseAuthLogin,
                                                                 validate_response: ValidateResponse,
                                                                 get_query_parameter: GetQueryParameter):
    response = base_auth_login_call()
    data_json = validate_response(response)
    response_type_string = get_query_parameter(data_json["redirect_uri"], "response_type")
    assert response_type_string == "code"


def should_save_state_in_database(base_auth_login_call: BaseAuthLogin, db_connection: DatabaseConnection,
                                  validate_response: ValidateResponse,
                                  get_query_parameter: GetQueryParameter):
    response = base_auth_login_call()
    data_json = validate_response(response)
    state_string = get_query_parameter(data_json["redirect_uri"], "state")
    with db_connection.session() as session:
        result = session.scalar(select(LoginState).where(LoginState.state_string == state_string))
    assert result, f"Did not find state with state string '{state_string}' from database after login route was called."


def should_get_redirect_uri_from_query_and_include_in_response(monkeypatch: MonkeyPatch, test_client: TestClient,
                                                               validate_response: ValidateResponse,
                                                               get_query_parameter: GetQueryParameter):
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "test")
    expected_redirect_uri = "https://example.redirect.test"
    response = test_client.get(f"/auth/login?client_redirect_uri={expected_redirect_uri}")
    data_json = validate_response(response)
    assert expected_redirect_uri == get_query_parameter(data_json["redirect_uri"], "redirect_uri")


def should_get_spotify_client_id_from_env_and_include_in_response(test_client: TestClient, monkeypatch: MonkeyPatch,
                                                                  validate_response: ValidateResponse,
                                                                  get_query_parameter: GetQueryParameter):
    expected_client_id = "test_client_id"
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", expected_client_id)
    response = test_client.get(f"/auth/login?client_redirect_uri=test")
    data_json = validate_response(response)
    assert expected_client_id == get_query_parameter(data_json["redirect_uri"], "client_id")


def should_return_internal_server_error_if_no_client_id_in_env(test_client: TestClient,
                                                               validate_response: ValidateResponse):
    response = test_client.get("/auth/login?client_redirect_uri=test")
    error = validate_response(response, 500)
    assert error["detail"] == "Internal server error"


def should_detail_internal_server_error_in_non_production_environment(test_client: TestClient, monkeypatch: MonkeyPatch,
                                                                      validate_response: ValidateResponse):
    monkeypatch.setenv("ENVIRONMENT", "development")
    response = test_client.get("/auth/login?client_redirect_uri=test")
    error = validate_response(response, 500)
    assert error["detail"] == "Could not find spotify client ID in environment variables"
