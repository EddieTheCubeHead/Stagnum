import datetime
from unittest.mock import Mock

import pytest
from sqlalchemy import select

from database.entities import UserSession


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


@pytest.mark.asyncio
async def should_refresh_token_in_queue_job(existing_playback, refresh_token_return, increment_now, run_scheduling_job,
                                            create_spotify_playback, db_connection, requests_client_post_queue,
                                            correct_env_variables, build_success_response):
    increment_now(datetime.timedelta(seconds=3600))
    create_spotify_playback()
    requests_client_post_queue.append(build_success_response({}))

    await run_scheduling_job()

    with db_connection.session() as session:
        user_session: UserSession = session.scalar(select(UserSession))

    assert user_session.user_token == f"Bearer {refresh_token_return}"


@pytest.mark.asyncio
async def should_accept_old_token_login_after_scheduler_refresh_and_return_new_token(existing_playback, increment_now,
                                                                                     refresh_token_return,
                                                                                     run_scheduling_job, db_connection,
                                                                                     create_spotify_playback,
                                                                                     requests_client_post_queue,
                                                                                     correct_env_variables,
                                                                                     build_success_response,
                                                                                     test_client, valid_token_header,
                                                                                     assert_token_in_headers):
    increment_now(datetime.timedelta(seconds=3600))
    create_spotify_playback()
    requests_client_post_queue.append(build_success_response({}))

    await run_scheduling_job()

    response = test_client.delete(f"/pool/content/{existing_playback[0]["uri"]}", headers=valid_token_header)

    token = assert_token_in_headers(response)
    assert token == f"Bearer {refresh_token_return}"
