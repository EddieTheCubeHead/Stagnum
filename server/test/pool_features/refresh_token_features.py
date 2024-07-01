import datetime
from unittest.mock import Mock

import pytest
from database.database_connection import ConnectionManager
from database.entities import UserSession
from faker import Faker
from sqlalchemy import select
from starlette.testclient import TestClient
from test_types.aliases import MockResponseQueue
from test_types.callables import (
    AssertTokenInHeaders,
    BuildSuccessResponse,
    GetExistingPool,
    IncrementNow,
    MockTokenReturn,
)
from test_types.typed_dictionaries import Headers

from pool_features.conftest import CreateSpotifyPlayback, RunSchedulingJob


@pytest.fixture
def refresh_token_return(
    mock_token_return: MockTokenReturn, requests_client_post_queue: MockResponseQueue, faker: Faker
) -> str:
    token: str = faker.uuid4()
    refresh_token_response_data = mock_token_return(token)
    requests_client_post_queue.append(refresh_token_response_data)
    return token


@pytest.mark.usefixtures("correct_env_variables", "existing_pool")
def should_refresh_token_if_expired_since_passed(
    get_existing_pool: GetExistingPool,
    test_client: TestClient,
    valid_token_header: Headers,
    assert_token_in_headers: AssertTokenInHeaders,
    increment_now: IncrementNow,
    refresh_token_return: str,
) -> None:
    existing_pool = get_existing_pool().users[0].tracks
    increment_now(datetime.timedelta(seconds=3600))

    response = test_client.delete(f"/pool/content/{existing_pool[0].id}", headers=valid_token_header)

    token = assert_token_in_headers(response)
    assert token == f"Bearer {refresh_token_return}"


@pytest.mark.asyncio
@pytest.mark.usefixtures("correct_env_variables", "existing_playback")
async def should_refresh_token_in_queue_job(
    refresh_token_return: str,
    increment_now: IncrementNow,
    db_connection: ConnectionManager,
    run_scheduling_job: RunSchedulingJob,
    create_spotify_playback: CreateSpotifyPlayback,
    requests_client_post_queue: MockResponseQueue,
    build_success_response: BuildSuccessResponse,
) -> None:
    increment_now(datetime.timedelta(seconds=3600))
    create_spotify_playback()
    requests_client_post_queue.append(build_success_response({}))

    await run_scheduling_job()

    with db_connection.session() as session:
        user_session: UserSession = session.scalar(select(UserSession))
    assert user_session.user_token == f"Bearer {refresh_token_return}"


@pytest.mark.asyncio
@pytest.mark.usefixtures("correct_env_variables", "existing_playback")
async def should_perform_job_api_call_with_correct_token_after_refresh_in_queue_job(
    refresh_token_return: str,
    increment_now: IncrementNow,
    run_scheduling_job: RunSchedulingJob,
    create_spotify_playback: CreateSpotifyPlayback,
    requests_client_post_queue: MockResponseQueue,
    build_success_response: BuildSuccessResponse,
    requests_client: Mock,
) -> None:
    increment_now(datetime.timedelta(seconds=3600))
    create_spotify_playback()
    requests_client_post_queue.append(build_success_response({}))

    await run_scheduling_job()

    assert requests_client.post.call_args[1] == {"headers": {"Authorization": f"Bearer {refresh_token_return}"}}


@pytest.mark.asyncio
@pytest.mark.usefixtures("correct_env_variables", "existing_playback")
async def should_accept_old_token_login_after_scheduler_refresh_and_return_new_token(
    get_existing_pool: GetExistingPool,
    increment_now: IncrementNow,
    refresh_token_return: str,
    run_scheduling_job: RunSchedulingJob,
    create_spotify_playback: CreateSpotifyPlayback,
    requests_client_post_queue: MockResponseQueue,
    build_success_response: BuildSuccessResponse,
    test_client: TestClient,
    valid_token_header: Headers,
    assert_token_in_headers: AssertTokenInHeaders,
) -> None:
    existing_pool = get_existing_pool().users[0].tracks
    increment_now(datetime.timedelta(seconds=3600))
    create_spotify_playback()
    requests_client_post_queue.append(build_success_response({}))
    await run_scheduling_job()

    response = test_client.delete(f"/pool/content/{existing_pool[0].id}", headers=valid_token_header)

    token = assert_token_in_headers(response)
    assert token == f"Bearer {refresh_token_return}"
