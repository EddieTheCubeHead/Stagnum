from unittest.mock import Mock

import httpx
import pytest
from api.pool.models import PoolFullContents
from database.database_connection import ConnectionManager
from database.entities import PlaybackSession, Pool, PoolJoinedUser, PoolMember, User
from sqlalchemy import select
from starlette.testclient import TestClient
from test_types.callables import (
    AssertEmptyPoolModel,
    AssertEmptyTables,
    MockPlaylistFetch,
    ValidateModel,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers, TrackData


@pytest.fixture
def assert_empty_pool_model(validate_model: ValidateModel) -> AssertEmptyPoolModel:
    def wrapper(response: httpx.Response) -> None:
        response_model = validate_model(PoolFullContents, response)
        assert response_model.users == []
        assert response_model.currently_playing is None
        assert response_model.share_code is None

    return wrapper


def should_wipe_whole_pool_on_delete_pool(
    existing_playback: list[TrackData],
    test_client: TestClient,
    validate_model: ValidateModel,
    assert_empty_pool_model: AssertEmptyPoolModel,
    db_connection: ConnectionManager,
    assert_empty_tables: AssertEmptyTables,
    valid_token_header: Headers,
) -> None:
    response = test_client.delete("/pool", headers=valid_token_header)

    assert_empty_pool_model(response)
    assert_empty_tables(Pool, PoolMember, PoolJoinedUser, PlaybackSession)


def should_send_playback_pause_on_pool_delete(
    existing_playback: list[TrackData], test_client: TestClient, requests_client: Mock, valid_token_header: Headers
) -> None:
    requests_client.put.reset_mock()

    test_client.delete("/pool", headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.args[0] == "https://api.spotify.com/v1/me/player/pause"


def should_wipe_leavers_pool_members_on_leave_pool(
    shared_pool_code: str,
    joined_user_header: Headers,
    test_client: TestClient,
    validate_response: ValidateResponse,
    db_connection: ConnectionManager,
    another_logged_in_user: User,
    assert_empty_pool_model: AssertEmptyPoolModel,
    mock_playlist_fetch: MockPlaylistFetch,
) -> None:
    pool_content_data = mock_playlist_fetch(35)
    test_client.post("/pool/content", json=pool_content_data, headers=joined_user_header)

    response = test_client.post("/pool/leave", headers=joined_user_header)

    assert_empty_pool_model(response)

    user_id = another_logged_in_user.spotify_id
    with db_connection.session() as session:
        assert session.scalar(select(PoolMember).where(PoolMember.user_id == user_id)) is None
        assert session.scalar(select(PoolJoinedUser).where(PoolJoinedUser.user_id == user_id)) is None
