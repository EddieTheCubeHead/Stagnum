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


def should_have_required_scopes_in_redirect_response(test_server, validate_response, _required_headers):
    response = test_server.get("/auth/login")
    data_json = validate_response(response)
    scopes_strings = re.match(r".*[&?]scopes=([\w -]+)(?:$|&.*)", data_json["redirect_uri"]).group(1).split(" ")
    for header in _required_headers:
        assert header in scopes_strings
