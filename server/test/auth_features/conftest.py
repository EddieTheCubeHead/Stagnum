import re

import pytest


@pytest.fixture
def get_query_parameter():
    restricted_characters = r"&"

    def wrapper(query_string, parameter_name) -> str:
        match = re.match(fr".*[&?]{parameter_name}=([^{restricted_characters}]+)(?:$|&.*)", query_string)
        assert match, f"Could not find query parameter {parameter_name} in query '{query_string}'"
        return match.group(1)
    return wrapper


@pytest.fixture
def base_auth_login_call(monkeypatch, test_client):
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "test")
    return lambda: test_client.get("/auth/login?client_redirect_uri=test")