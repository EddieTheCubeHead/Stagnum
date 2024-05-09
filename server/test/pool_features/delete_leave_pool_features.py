from typing import Any
from unittest.mock import Mock

from sqlalchemy import select
from starlette.testclient import TestClient

from api.pool.models import PoolContent, PoolFullContents
from database.database_connection import ConnectionManager
from database.entities import Pool, PoolMember, PoolJoinedUser, PlaybackSession, User
from pool_features.conftest import MockPlaylistFetchResult
from test_types.typed_dictionaries import Headers
from test_types.callables import ValidateResponse, BuildSuccessResponse
from test_types.aliases import MockResponseQueue


def should_wipe_whole_pool_on_delete_pool(existing_playback: list[dict[str, Any]], test_client: TestClient,
                                          validate_response: ValidateResponse,
                                          db_connection: ConnectionManager,
                                          valid_token_header: Headers):
    response = test_client.delete("/pool", headers=valid_token_header)

    response_model = PoolFullContents.model_validate(validate_response(response))
    assert response_model.users == []
    assert response_model.currently_playing is None
    assert response_model.share_code is None

    with db_connection.session() as session:
        assert session.scalar(select(Pool)) is None
        assert session.scalar(select(PoolMember)) is None
        assert session.scalar(select(PoolJoinedUser)) is None
        assert session.scalar(select(PlaybackSession)) is None


def should_send_playback_pause_on_pool_delete(existing_playback: list[dict[str, Any]], test_client: TestClient,
                                              requests_client: Mock, valid_token_header: Headers):
    requests_client.put.reset_mock()

    test_client.delete("/pool", headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.args[0] == "https://api.spotify.com/v1/me/player/pause"


def should_wipe_leavers_pool_members_on_leave_pool(
        shared_pool_code: str, another_logged_in_user_header: Headers, test_client: TestClient,
        validate_response: ValidateResponse, db_connection: ConnectionManager,
        create_mock_playlist_fetch_result: MockPlaylistFetchResult,
        requests_client_get_queue: MockResponseQueue, build_success_response: BuildSuccessResponse,
        another_logged_in_user: User):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    playlist = create_mock_playlist_fetch_result(35).first_fetch
    requests_client_get_queue.append(build_success_response(playlist))
    pool_content_data = PoolContent(spotify_uri=playlist["uri"]).model_dump()

    test_client.post("/pool/content", json=pool_content_data, headers=another_logged_in_user_header)

    response = test_client.post("/pool/leave", headers=another_logged_in_user_header)

    response_model = PoolFullContents.model_validate(validate_response(response))
    assert response_model.users == []
    assert response_model.currently_playing is None
    assert response_model.share_code is None

    user_id = another_logged_in_user.spotify_id
    with db_connection.session() as session:
        assert session.scalar(select(PoolMember).where(PoolMember.user_id == user_id)) is None
        assert session.scalar(select(PoolJoinedUser).where(PoolJoinedUser.user_id == user_id)) is None
