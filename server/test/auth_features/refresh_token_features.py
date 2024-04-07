import datetime
from unittest.mock import Mock

import pytest


@pytest.fixture
def refresh_token_return(mock_token_return, requests_client, faker):
    token = faker.uuid4()
    refresh_token_response_data = mock_token_return(token)
    requests_client.post = Mock(return_value=refresh_token_response_data)
    return token


@pytest.mark.wip
def should_refresh_token_if_expired_since_passed(existing_pool, refresh_token_return, test_client, valid_token_header,
                                                 assert_token_in_headers, monkeypatch, correct_env_variables):
    delta_to_soon = datetime.timedelta(seconds=3600)
    soon = datetime.datetime.now() + delta_to_soon
    soon_utc = datetime.datetime.now(datetime.timezone.utc) + delta_to_soon

    class MockDateTime:
        @classmethod
        def now(cls, tz_info=None):
            return soon if tz_info is None else soon_utc

    monkeypatch.setattr(datetime, "datetime", MockDateTime)

    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    token = assert_token_in_headers(response)
    assert token == f"Bearer {refresh_token_return}"
