import re
import datetime

import pytest
from sqlalchemy import select
from starlette.testclient import TestClient

from api.auth.dependencies import AuthDatabaseConnectionRaw
from api.auth.routes import cleanup_state_strings
from api.common.dependencies import DatabaseConnection
from database.entities import LoginState


@pytest.fixture
def _required_headers():
    return [
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-private",
        "user-read-email"
    ]


@pytest.fixture
def _get_query_parameter():
    restricted_characters = r"&"

    def wrapper(query_string, parameter_name) -> str:
        match = re.match(fr".*[&?]{parameter_name}=([^{restricted_characters}]+)(?:$|&.*)", query_string)
        assert match, f"Could not find query parameter {parameter_name} in query '{query_string}'"
        return match.group(1)
    return wrapper


@pytest.fixture
def _base_call(monkeypatch, test_client):
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "test")
    return lambda: test_client.get("/auth/login?client_redirect_uri=test")


def should_have_required_scopes_in_login_redirect_response(_base_call, validate_response, _required_headers,
                                                           _get_query_parameter):
    response = _base_call()
    data_json = validate_response(response)
    scopes_strings = _get_query_parameter(data_json["redirect_uri"], "scopes").split(" ")
    for header in _required_headers:
        assert header in scopes_strings


def should_have_sixteen_bytes_of_noise_as_state_in_login_redirect_response(_base_call, validate_response,
                                                                           _get_query_parameter):
    response = _base_call()
    data_json = validate_response(response)
    state_string = _get_query_parameter(data_json["redirect_uri"], "state")
    assert re.match(r"\w{16}", state_string), (f"State string '{state_string}' does not consist of sixteen "
                                               f"digits or letters")


def should_have_random_state_in_login_redirect_response(_base_call, validate_response, _get_query_parameter):
    responses = [_base_call() for _ in range(10)]
    response_contents = [validate_response(response) for response in responses]
    state_strings = [_get_query_parameter(data["redirect_uri"], "state") for data in response_contents]
    assert len(set(state_strings)) == 10, f"Did not find 10 unique strings in collection '{state_strings}'"


def should_save_state_in_database(_base_call, db_connection: DatabaseConnection, validate_response,
                                  _get_query_parameter):
    response = _base_call()
    data_json = validate_response(response)
    state_string = _get_query_parameter(data_json["redirect_uri"], "state")
    with db_connection.session() as session:
        result = session.scalar(select(LoginState).where(LoginState.state_string == state_string))
    assert result, f"Did not find state with state string '{state_string}' from database after login route was called."


def should_get_redirect_url_from_query_and_include_in_response(monkeypatch, test_client: TestClient, validate_response,
                                                               _get_query_parameter):
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "test")
    expected_redirect_uri = "https://example.redirect.test"
    response = test_client.get(f"/auth/login?client_redirect_uri={expected_redirect_uri}")
    data_json = validate_response(response)
    assert expected_redirect_uri == _get_query_parameter(data_json["redirect_uri"], "redirect_uri")


def should_get_spotify_client_id_from_env_and_include_in_response(test_client: TestClient, validate_response,
                                                                  _get_query_parameter, monkeypatch):
    expected_client_id = "test_client_id"
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", expected_client_id)
    response = test_client.get(f"/auth/login?client_redirect_uri=test")
    data_json = validate_response(response)
    assert expected_client_id == _get_query_parameter(data_json["redirect_uri"], "client_id")


def should_return_internal_server_error_if_no_client_id_in_env(test_client: TestClient, validate_response):
    response = test_client.get("/auth/login?client_redirect_uri=test")
    validate_response(response, 500)


def should_cleanup_expired_states_from_database_on_cleanup_job(monkeypatch, _base_call, validate_response,
                                                               _get_query_parameter, db_connection):
    response = _base_call()
    data_json = validate_response(response)
    state_string = _get_query_parameter(data_json["redirect_uri"], "state")
    soon = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15, seconds=1)

    class MockDateTime:
        @classmethod
        def now(cls, *args):
            return soon

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    cleanup_state_strings(AuthDatabaseConnectionRaw(db_connection))
    with db_connection.session() as session:
        found_state = session.scalar(select(LoginState).where(LoginState.state_string == state_string))
    assert found_state is None


@pytest.mark.wip
def should_not_cleanup_non_expired_states_from_database_on_cleanup_job(monkeypatch, _base_call, validate_response,
                                                                       _get_query_parameter, db_connection):
    response = _base_call()
    data_json = validate_response(response)
    state_string = _get_query_parameter(data_json["redirect_uri"], "state")
    soon = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=14)

    class MockDateTime:
        @classmethod
        def now(cls, *args):
            return soon

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    cleanup_state_strings(AuthDatabaseConnectionRaw(db_connection))
    with db_connection.session() as session:
        found_state = session.scalar(select(LoginState).where(LoginState.state_string == state_string))
    assert found_state
