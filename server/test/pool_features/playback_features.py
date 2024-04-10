import datetime
from unittest.mock import Mock

import pytest
from sqlalchemy import select

from api.common.dependencies import TokenHolder
from api.pool.tasks import queue_next_songs
from database.entities import PlaybackSession


def should_start_pool_playback_from_tracks_when_posting_new_pool_from_tracks(create_mock_track_search_result,
                                                                             requests_client, build_success_response,
                                                                             create_pool_creation_data_json,
                                                                             test_client, valid_token_header,
                                                                             requests_client_get_queue):
    tracks = [create_mock_track_search_result() for _ in range(15)]
    responses = [build_success_response(track) for track in tracks]
    requests_client_get_queue.extend(responses)
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


def should_save_next_track_change_time_on_playback_start(create_mock_track_search_result, requests_client_get_queue,
                                                         build_success_response, create_pool_creation_data_json,
                                                         test_client, valid_token_header, db_connection,
                                                         logged_in_user_id, approx_datetime, mock_datetime_wrapper):
    tracks = [create_mock_track_search_result() for _ in range(1)]
    responses = [build_success_response(track) for track in tracks]
    requests_client_get_queue.extend(responses)
    track_uris = [track["uri"] for track in tracks]
    data_json = create_pool_creation_data_json(*track_uris)
    start_time = mock_datetime_wrapper.now()

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        playback_session = session.scalar(select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user_id))
    expected_end_time = start_time + datetime.timedelta(milliseconds=tracks[0]["duration_ms"])
    actual_end_time = mock_datetime_wrapper.ensure_utc(playback_session.next_song_change_timestamp)
    assert actual_end_time == approx_datetime(expected_end_time, datetime.timedelta(milliseconds=500))


@pytest.mark.asyncio
async def should_add_song_to_playback_if_state_next_song_is_under_two_seconds_away(existing_playback, increment_now,
                                                                                   fixed_track_length_ms,
                                                                                   valid_token_header, requests_client,
                                                                                   get_query_parameter,
                                                                                   run_scheduling_job):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    await run_scheduling_job()
    actual_call = requests_client.post.call_args
    assert actual_call.args[0].startswith("https://api.spotify.com/v1/me/player/queue")
    called_uri = get_query_parameter(actual_call.args[0], "uri")
    assert called_uri in [track["uri"] for track in existing_playback]
    assert actual_call.kwargs["headers"] == valid_token_header


def should_not_add_song_to_playback_if_state_next_song_is_over_two_seconds_away(existing_playback, increment_now,
                                                                                fixed_track_length_ms,
                                                                                playback_service, requests_client):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 3000)))
    queue_next_songs(playback_service)
    actual_call = requests_client.post.call_args
    assert actual_call is None


@pytest.mark.asyncio
async def should_inactivate_sessions_for_logged_out_users(db_connection, playback_service, existing_playback,
                                                          valid_token_header, mock_token_holder: TokenHolder,
                                                          logged_in_user_id, fixed_track_length_ms, increment_now):
    mock_token_holder.log_out(valid_token_header["Authorization"])

    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    await queue_next_songs(playback_service)

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(
            select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user_id))

    assert not playback_state.is_active


def should_reactivate_inactive_playback_on_post_pool(db_connection, playback_service, requests_client_get_queue,
                                                     valid_token_header, mock_token_holder: TokenHolder,
                                                     logged_in_user, fixed_track_length_ms, increment_now,
                                                     create_mock_track_search_result, build_success_response,
                                                     existing_playback, create_pool_creation_data_json, test_client,
                                                     primary_user_token, auth_database_connection):
    mock_token_holder.log_out(valid_token_header["Authorization"])

    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    queue_next_songs(playback_service)
    auth_database_connection.update_logged_in_user(logged_in_user, primary_user_token)

    tracks = [create_mock_track_search_result() for _ in range(1)]
    responses = [build_success_response(track) for track in tracks]
    requests_client_get_queue.extend(responses)
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


def should_return_token_in_headers_for_skip_route(existing_playback, valid_token_header, requests_client, skip_song,
                                                  assert_token_in_headers):
    response = skip_song(valid_token_header)
    assert_token_in_headers(response)


@pytest.mark.asyncio
async def should_defer_skip_if_spotify_not_close_to_song_end(requests_client, run_scheduling_job, fixed_track_length_ms,
                                                             existing_playback, increment_now, create_spotify_playback):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(5000)
    await run_scheduling_job()
    assert len(requests_client.post.call_args_list) == 0


@pytest.mark.asyncio
async def should_update_playback_end_time_in_db_after_defer(run_scheduling_job, fixed_track_length_ms, increment_now,
                                                            existing_playback, db_connection, create_spotify_playback,
                                                            mock_datetime_wrapper, approx_datetime):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    expected_end_time = create_spotify_playback(5000)
    await run_scheduling_job()

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(select(PlaybackSession))

    actual_timestamp = mock_datetime_wrapper.ensure_utc(playback_state.next_song_change_timestamp)
    assert actual_timestamp == approx_datetime(expected_end_time)


@pytest.mark.asyncio
async def should_correct_playback_time_based_on_spotify_status(requests_client, run_scheduling_job, existing_playback,
                                                               fixed_track_length_ms, mock_datetime_wrapper,
                                                               increment_now, db_connection, approx_datetime,
                                                               create_spotify_playback):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 50)))
    expected_end_time = create_spotify_playback(1950) + datetime.timedelta(milliseconds=fixed_track_length_ms)
    await run_scheduling_job()

    assert len(requests_client.post.call_args_list) == 1

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(select(PlaybackSession))

    actual_timestamp = mock_datetime_wrapper.ensure_utc(playback_state.next_song_change_timestamp)
    assert actual_timestamp == approx_datetime(expected_end_time)


@pytest.mark.asyncio
async def should_fix_playback_data_if_playing_song_has_changed(run_scheduling_job, fixed_track_length_ms, increment_now,
                                                               existing_playback, db_connection, mock_datetime_wrapper,
                                                               create_spotify_playback, approx_datetime,
                                                               create_mock_track_search_result, requests_client):
    new_track_data = create_mock_track_search_result()
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    expected_end_time = create_spotify_playback(20000, 0, new_track_data)
    await run_scheduling_job()
    assert len(requests_client.post.call_args_list) == 0

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(select(PlaybackSession))

    assert playback_state.current_track_uri == new_track_data["uri"]
    actual_change_timestamp = mock_datetime_wrapper.ensure_utc(playback_state.next_song_change_timestamp)
    assert actual_change_timestamp == approx_datetime(expected_end_time)
