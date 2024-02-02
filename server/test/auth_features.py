import re
from unittest.mock import Mock, AsyncMock

import pytest


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
    restricted_characters = r":\/?#\[\]@!$&'()*+,;="

    def wrapper(query_string, parameter_name) -> str:
        match = re.match(fr".*[&?]{parameter_name}=([^{restricted_characters}]+)(?:$|&.*)", query_string)
        assert match, f"Could not find query parameter {parameter_name} in query '{query_string}'"
        return match.group(1)
    return wrapper


def should_have_required_scopes_in_login_redirect_response(test_client, validate_response, _required_headers,
                                                           _get_query_parameter):
    response = test_client.get("/auth/login")
    data_json = validate_response(response)
    scopes_strings = _get_query_parameter(data_json["redirect_uri"], "scopes").split(" ")
    for header in _required_headers:
        assert header in scopes_strings


def should_have_sixteen_bytes_of_noise_as_state_in_login_redirect_response(test_client, validate_response,
                                                                           _get_query_parameter):
    response = test_client.get("/auth/login")
    data_json = validate_response(response)
    state_string = _get_query_parameter(data_json["redirect_uri"], "state")
    assert re.match(r"\w{16}", state_string), (f"State string '{state_string}' does not consist of sixteen "
                                               f"digits or letters")


def should_have_random_state_in_login_redirect_response(test_client, validate_response, _get_query_parameter):
    responses = [test_client.get("/auth/login") for _ in range(10)]
    response_contents = [validate_response(response) for response in responses]
    state_strings = [_get_query_parameter(data["redirect_uri"], "state") for data in response_contents]
    assert len(set(state_strings)) == 10, f"Did not find 10 unique strings in collection '{state_strings}'"
