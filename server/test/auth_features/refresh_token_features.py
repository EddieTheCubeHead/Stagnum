import datetime
from unittest.mock import Mock

import pytest


@pytest.fixture
def refresh_token_return(mock_token_return, requests_client_post_queue, faker):
    token = faker.uuid4()
    refresh_token_response_data = mock_token_return(token)
    requests_client_post_queue.append(refresh_token_response_data)
    return token


def should_refresh_token_if_expired_since_passed(existing_pool, refresh_token_return, test_client, valid_token_header,
                                                 assert_token_in_headers, increment_now, correct_env_variables):
    increment_now(datetime.timedelta(seconds=3600))

    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    token = assert_token_in_headers(response)
    assert token == f"Bearer {refresh_token_return}"
