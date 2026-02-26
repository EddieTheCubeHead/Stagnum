from http import HTTPStatus
from unittest.mock import Mock

import httpx
import pytest
from sqlalchemy import select
from starlette.testclient import TestClient

from api.pool.models import PoolFullContents
from database.database_connection import ConnectionManager
from database.entities import PlaybackSession, Pool, PoolJoinedUser, PoolMember, User
from test_types.aliases import MockResponseQueue
from test_types.callables import (
    AssertEmptyPoolModel,
    AssertEmptyTables,
    BuildErrorResponse,
    MockPlaylistFetch,
    ValidateModel,
)
from test_types.typed_dictionaries import Headers


@pytest.fixture
def assert_empty_pool_model(validate_model: ValidateModel) -> AssertEmptyPoolModel:
    def wrapper(response: httpx.Response) -> None:
        response_model = validate_model(PoolFullContents, response)
        assert response_model.users == []
        assert response_model.currently_playing is None
        assert response_model.share_code is None

    return wrapper


@pytest.mark.usefixtures("existing_playback")
def should_wipe_whole_pool_on_delete_pool(
    test_client: TestClient,
    assert_empty_pool_model: AssertEmptyPoolModel,
    assert_empty_tables: AssertEmptyTables,
    valid_token_header: Headers,
) -> None:
    response = test_client.delete("/pool", headers=valid_token_header)

    assert_empty_pool_model(response)
    assert_empty_tables(Pool, PoolMember, PoolJoinedUser, PlaybackSession)


@pytest.mark.usefixtures("existing_playback")
def should_send_playback_pause_on_pool_delete(
    test_client: TestClient, requests_client: Mock, valid_token_header: Headers
) -> None:
    requests_client.put.reset_mock()

    test_client.delete("/pool", headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.args[0] == "https://api.spotify.com/v1/me/player/pause"


def should_wipe_leavers_pool_members_on_leave_pool(
    joined_user_header: Headers,
    test_client: TestClient,
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


@pytest.mark.usefixtures("existing_playback")
def should_not_throw_on_pool_delete_if_spotify_playback_not_found(
    test_client: TestClient,
    assert_empty_pool_model: AssertEmptyPoolModel,
    assert_empty_tables: AssertEmptyTables,
    valid_token_header: Headers,
    #  Fixture ordering is important here so no mark.usefixtures for this one
    no_playback_spotify_error: None,  # noqa: ARG001
) -> None:
    response = test_client.delete("/pool", headers=valid_token_header)

    assert_empty_pool_model(response)
    assert_empty_tables(Pool, PoolMember, PoolJoinedUser, PlaybackSession)
