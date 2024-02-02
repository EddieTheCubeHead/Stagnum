import string
import random

import pytest

from database.entities import LoginState


@pytest.fixture
def base_auth_callback_call(test_client, valid_state_string):
    return lambda: test_client.get(f"/auth/login/callback?state={valid_state_string}&code=12345abcde")


@pytest.fixture
def valid_state_string(db_connection):
    state_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
    with db_connection.session() as session:
        session.add(LoginState(state_string=state_string))
    return state_string


@pytest.fixture
def spotify_auth_client(requests_client):
    pass


def should_return_exception_if_state_is_not_in_database_on_auth_callback(test_client, validate_response):
    response = test_client.get(f"/auth/login/callback?state=my_invalid_state&code=12345abcde")
    exception = validate_response(response, 403)
    assert exception["detail"] == "Login state is invalid or expired"


def should_return_token_from_spotify_if_state_is_valid(test_client, validate_response, requests_client):
    pass
