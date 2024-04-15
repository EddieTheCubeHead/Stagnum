import pytest
from sqlalchemy import select

from api.pool.models import PoolContent, PoolFullContents
from database.entities import Pool, PoolMember, PoolJoinedUser, PlaybackSession


def should_wipe_whole_pool_on_delete_pool(existing_playback, test_client, validate_response, db_connection,
                                          valid_token_header):
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


def should_wipe_leavers_pool_members_on_leave_pool(shared_pool_code, another_logged_in_user_header, test_client,
                                                   validate_response, db_connection, create_mock_playlist_fetch_result,
                                                   requests_client_get_queue, build_success_response,
                                                   another_logged_in_user):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    playlist = create_mock_playlist_fetch_result(35)
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
