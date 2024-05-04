import datetime
from typing import Any

import httpx
import pytest
from faker import Faker
from sqlalchemy import select
from starlette.testclient import TestClient

from conftest import mock_token_return_callable, assert_token_in_headers_callable, increment_now_callable, \
    build_success_response_callable
from database.database_connection import ConnectionManager
from database.entities import UserSession, PoolMember
from pool_features.conftest import run_scheduling_job_awaitable, create_spotify_playback_callable


@pytest.fixture
def refresh_token_return(mock_token_return: mock_token_return_callable,
                         requests_client_post_queue: MockResponseQueue, faker: Faker) -> str:
    token: str = faker.uuid4()
    refresh_token_response_data = mock_token_return(token)
    requests_client_post_queue.append(refresh_token_response_data)
    return token


def should_refresh_token_if_expired_since_passed(existing_pool: list[PoolMember], correct_env_variables: SpotifySecrets,
                                                 test_client: TestClient, valid_token_header: Headers,
                                                 assert_token_in_headers: assert_token_in_headers_callable,
                                                 increment_now: increment_now_callable, refresh_token_return: str):
    increment_now(datetime.timedelta(seconds=3600))

    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    token = assert_token_in_headers(response)
    assert token == f"Bearer {refresh_token_return}"


@pytest.mark.asyncio
async def should_refresh_token_in_queue_job(existing_playback: list[dict[str, Any]], refresh_token_return: str,
                                            increment_now: increment_now_callable, db_connection: ConnectionManager,
                                            run_scheduling_job: run_scheduling_job_awaitable,
                                            create_spotify_playback: create_spotify_playback_callable,
                                            requests_client_post_queue: MockResponseQueue,
                                            correct_env_variables: SpotifySecrets,
                                            build_success_response: build_success_response_callable):
    increment_now(datetime.timedelta(seconds=3600))
    create_spotify_playback()
    requests_client_post_queue.append(build_success_response({}))

    await run_scheduling_job()

    with db_connection.session() as session:
        user_session: UserSession = session.scalar(select(UserSession))

    assert user_session.user_token == f"Bearer {refresh_token_return}"


@pytest.mark.asyncio
async def should_accept_old_token_login_after_scheduler_refresh_and_return_new_token(
        existing_playback: list[dict[str, Any]], increment_now: increment_now_callable, refresh_token_return: str,
        run_scheduling_job, db_connection, create_spotify_playback: create_spotify_playback_callable,
        requests_client_post_queue: MockResponseQueue, correct_env_variables: SpotifySecrets,
        build_success_response: build_success_response_callable, test_client: TestClient,
        valid_token_header: Headers, assert_token_in_headers: assert_token_in_headers_callable):
    increment_now(datetime.timedelta(seconds=3600))
    create_spotify_playback()
    requests_client_post_queue.append(build_success_response({}))

    await run_scheduling_job()

    response = test_client.delete(f"/pool/content/{existing_playback[0]["uri"]}", headers=valid_token_header)

    token = assert_token_in_headers(response)
    assert token == f"Bearer {refresh_token_return}"
