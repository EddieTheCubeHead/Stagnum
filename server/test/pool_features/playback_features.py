import datetime
from unittest.mock import Mock

import pytest
from sqlalchemy import select

from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import TokenHolder
from api.pool.tasks import queue_next_songs
from database.entities import PlaybackSession


def should_start_pool_playback_from_tracks_when_posting_new_pool_from_tracks(create_mock_track_search_result,
                                                                             requests_client, build_success_response,
                                                                             create_pool_creation_data_json,
                                                                             test_client, valid_token_header):
    tracks = [create_mock_track_search_result() for _ in range(15)]
    responses = [build_success_response(track) for track in tracks]
    requests_client.get = Mock(side_effect=responses)
    track_uris = [track["uri"] for track in tracks]
    data_json = create_pool_creation_data_json(*track_uris)

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.kwargs["json"]["position_ms"] == 0
    call_uri = actual_call.kwargs["json"]["uris"][0]
    assert call_uri in track_uris


def should_start_pool_playback_from_collection_tracks_when_posting_collection(create_mock_track_search_result,
                                                                              create_mock_playlist_fetch_result,
                                                                              requests_client, build_success_response,
                                                                              create_pool_creation_data_json,
                                                                              test_client, valid_token_header):
    playlist = create_mock_playlist_fetch_result(25)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.kwargs["json"]["position_ms"] == 0
    call_uri = actual_call.kwargs["json"]["uris"][0]
    expected_track_uris = [track["track"]["uri"] for track in playlist["tracks"]["items"]]
    assert call_uri in expected_track_uris


def should_start_pool_playback_from_playlist_fetch_data_correctly(create_mock_playlist_fetch_result,
                                                                  requests_client, build_success_response,
                                                                  create_pool_creation_data_json,
                                                                  test_client, valid_token_header):
    playlist = create_mock_playlist_fetch_result(30)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.kwargs["json"]["position_ms"] == 0
    call_uri = actual_call.kwargs["json"]["uris"][0]
    assert call_uri in [track["track"]["uri"] for track in playlist["tracks"]["items"]]


@pytest.mark.slow
@pytest.mark.parametrize("repeat", range(15))
def should_not_start_pool_playback_from_collection_uri_when_posting_collection(create_mock_track_search_result,
                                                                               create_mock_playlist_fetch_result,
                                                                               requests_client, build_success_response,
                                                                               create_pool_creation_data_json,
                                                                               test_client, valid_token_header, repeat):
    # use only one track so test fails with repeats if main collection is ever used
    playlist = create_mock_playlist_fetch_result(1)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.kwargs["json"]["position_ms"] == 0
    call_uri = actual_call.kwargs["json"]["uris"][0]
    assert call_uri == playlist["tracks"]["items"][0]["track"]["uri"]


def should_save_next_track_change_time_on_playback_start(create_mock_track_search_result, requests_client,
                                                         build_success_response, create_pool_creation_data_json,
                                                         test_client, valid_token_header, db_connection,
                                                         logged_in_user_id):
    tracks = [create_mock_track_search_result() for _ in range(1)]
    responses = [build_success_response(track) for track in tracks]
    requests_client.get = Mock(side_effect=responses)
    track_uris = [track["uri"] for track in tracks]
    data_json = create_pool_creation_data_json(*track_uris)
    start_time = datetime.datetime.now()

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        playback_session = session.scalar(select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user_id))
    expected_end_time = start_time + datetime.timedelta(milliseconds=tracks[0]["duration_ms"])
    assert playback_session.next_song_change_timestamp - expected_end_time < datetime.timedelta(seconds=1)


@pytest.mark.asyncio
async def should_add_song_to_playback_if_state_next_song_is_under_two_seconds_away(existing_playback, monkeypatch,
                                                                                   fixed_track_length_ms,
                                                                                   valid_token_header, requests_client,
                                                                                   get_query_parameter,
                                                                                   run_scheduling_job):
    delta_to_soon = datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000))
    soon = datetime.datetime.now() + delta_to_soon
    soon_utc = datetime.datetime.now(datetime.timezone.utc) + delta_to_soon

    class MockDateTime:
        @classmethod
        def now(cls, tz_info=None):
            return soon if tz_info is None else soon_utc

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    await run_scheduling_job()
    actual_call = requests_client.post.call_args
    assert actual_call.args[0].startswith("https://api.spotify.com/v1/me/player/queue")
    called_uri = get_query_parameter(actual_call.args[0], "uri")
    assert called_uri in [track["uri"] for track in existing_playback]
    assert actual_call.kwargs["headers"] == valid_token_header


def should_not_add_song_to_playback_if_state_next_song_is_over_two_seconds_away(existing_playback, monkeypatch,
                                                                                fixed_track_length_ms,
                                                                                playback_service, requests_client):
    delta_to_soon = datetime.timedelta(milliseconds=(fixed_track_length_ms - 3000))
    soon = datetime.datetime.now() + delta_to_soon
    soon_utc = datetime.datetime.now(datetime.timezone.utc) + delta_to_soon

    class MockDateTime:
        @classmethod
        def now(cls, tz_info=None):
            return soon if tz_info is None else soon_utc

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    queue_next_songs(playback_service)
    actual_call = requests_client.post.call_args
    assert actual_call is None


@pytest.mark.asyncio
async def should_inactivate_sessions_for_logged_out_users(db_connection, playback_service, existing_playback,
                                                    valid_token_header, mock_token_holder: TokenHolder,
                                                    logged_in_user_id, fixed_track_length_ms, monkeypatch):
    mock_token_holder.log_out(valid_token_header["Authorization"])

    delta_to_soon = datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000))
    soon = datetime.datetime.now() + delta_to_soon
    soon_utc = datetime.datetime.now(datetime.timezone.utc) + delta_to_soon

    class MockDateTime:
        @classmethod
        def now(cls, tz_info=None):
            return soon if tz_info is None else soon_utc

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    await queue_next_songs(playback_service)

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(
            select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user_id))

    assert not playback_state.is_active


def should_reactivate_inactive_playback_on_post_pool(db_connection, playback_service, existing_playback,
                                                     valid_token_header, mock_token_holder: TokenHolder,
                                                     logged_in_user, fixed_track_length_ms, monkeypatch,
                                                     create_mock_track_search_result, build_success_response,
                                                     requests_client, create_pool_creation_data_json, test_client,
                                                     primary_user_token):
    mock_token_holder.log_out(valid_token_header["Authorization"])

    delta_to_soon = datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000))
    soon = datetime.datetime.now() + delta_to_soon
    soon_utc = datetime.datetime.now(datetime.timezone.utc) + delta_to_soon

    class MockDateTime:
        @classmethod
        def now(cls, tz_info=None):
            return soon if tz_info is None else soon_utc

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    queue_next_songs(playback_service)
    AuthDatabaseConnection(db_connection).update_logged_in_user(logged_in_user, primary_user_token)

    tracks = [create_mock_track_search_result() for _ in range(1)]
    responses = [build_success_response(track) for track in tracks]
    requests_client.get = Mock(side_effect=responses)
    track_uris = [track["uri"] for track in tracks]
    data_json = create_pool_creation_data_json(*track_uris)

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(
            select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user.spotify_id))

    assert playback_state.is_active


def should_be_able_to_skip_song_with_skip_route(existing_playback, valid_token_header, requests_client, skip_song,
                                                get_query_parameter):
    skip_song(valid_token_header)

    actual_queue_call = requests_client.post.call_args_list[0]
    actual_skip_call = requests_client.post.call_args_list[1]
    assert actual_queue_call.args[0].startswith("https://api.spotify.com/v1/me/player/queue")
    called_uri = get_query_parameter(actual_queue_call.args[0], "uri")
    assert called_uri in [track["uri"] for track in existing_playback]
    assert actual_queue_call.kwargs["headers"] == valid_token_header
    assert actual_skip_call.args[0].startswith("https://api.spotify.com/v1/me/player/next")
    assert actual_skip_call.kwargs["headers"] == valid_token_header


def should_ensure_queue_is_empty_before_skipping_song(existing_playback, valid_token_header, test_client,
                                                      requests_client, song_in_queue, validate_response):
    response = test_client.post("/pool/playback/skip", headers=valid_token_header)

    json_data = validate_response(response, 400)
    assert json_data["detail"] == ("Songs detected in Spotify queue! Please ensure your queue is empty by skipping "
                                   "in Spotify until the player repeats one song. Then reset Stagnum playback status "
                                   "by skipping a song in Stagnum. We are sorry for the inconvenience, Spotify does "
                                   "not offer tools for us to do this automatically.")
