import datetime
from typing import Any
from unittest.mock import Mock

import httpx
import pytest
from sqlalchemy import select
from starlette.testclient import TestClient

from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import TokenHolder
from api.common.models import ParsedTokenResponse
from api.pool.dependencies import PoolPlaybackServiceRaw
from api.pool.tasks import queue_next_songs
from conftest import ApproxDatetime, mock_track_search_result_callable, build_success_response_callable, \
    create_pool_creation_data_json_callable, MockDateTimeWrapper, increment_now_callable, get_query_parameter_callable, \
    validate_response_callable, assert_token_in_headers_callable
from database.database_connection import ConnectionManager
from database.entities import PlaybackSession, Pool, User
from pool_features.conftest import mock_playlist_fetch_result_callable, run_scheduling_job_awaitable, \
    skip_song_callable, create_spotify_playback_callable, BuildQueue, mock_filled_queue_get_callable, \
    mock_no_player_state_response_callable, mock_playback_paused_response_callable


def should_start_pool_playback_from_tracks_when_posting_new_pool_from_tracks(
        create_mock_track_search_result: mock_track_search_result_callable, requests_client: Mock,
        build_success_response: build_success_response_callable, test_client: TestClient,
        create_pool_creation_data_json: create_pool_creation_data_json_callable,
        valid_token_header: Headers, requests_client_get_queue: MockResponseQueue):
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


def should_start_pool_playback_from_collection_tracks_when_posting_collection(
        create_mock_track_search_result: mock_track_search_result_callable, test_client: TestClient,
        create_mock_playlist_fetch_result: mock_playlist_fetch_result_callable, valid_token_header: Headers,
        requests_client_get_queue: MockResponseQueue, build_success_response: build_success_response_callable,
        create_pool_creation_data_json: create_pool_creation_data_json_callable, requests_client: Mock):
    playlist = create_mock_playlist_fetch_result(25)
    requests_client_get_queue.append(build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.kwargs["json"]["position_ms"] == 0
    call_uri = actual_call.kwargs["json"]["uris"][0]
    expected_track_uris = [track["track"]["uri"] for track in playlist["tracks"]["items"]]
    assert call_uri in expected_track_uris


def should_start_pool_playback_from_playlist_fetch_data_correctly(
        create_mock_playlist_fetch_result: mock_playlist_fetch_result_callable, requests_client: Mock,
        build_success_response: build_success_response_callable, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: create_pool_creation_data_json_callable, test_client: TestClient,
        valid_token_header: Headers):
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
def should_not_start_pool_playback_from_collection_uri_when_posting_collection(
        create_mock_track_search_result: mock_track_search_result_callable, requests_client: Mock,
        create_mock_playlist_fetch_result: mock_playlist_fetch_result_callable, test_client: TestClient,
        build_success_response: build_success_response_callable, valid_token_header: Headers,
        create_pool_creation_data_json: create_pool_creation_data_json_callable, repeat: int):
    # use only one track so test fails with repeats if main collection is ever used
    playlist = create_mock_playlist_fetch_result(1)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.kwargs["json"]["position_ms"] == 0
    call_uri = actual_call.kwargs["json"]["uris"][0]
    assert call_uri == playlist["tracks"]["items"][0]["track"]["uri"]


def should_save_next_track_change_time_on_playback_start(
        create_mock_track_search_result: mock_track_search_result_callable, valid_token_header: Headers,
        requests_client_get_queue: MockResponseQueue, build_success_response: build_success_response_callable,
        create_pool_creation_data_json: create_pool_creation_data_json_callable, test_client: TestClient,
        db_connection: ConnectionManager, logged_in_user_id: str, mock_datetime_wrapper: MockDateTimeWrapper):
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
    assert actual_end_time == ApproxDatetime(expected_end_time, datetime.timedelta(milliseconds=500))


@pytest.mark.asyncio
async def should_add_song_to_playback_if_state_next_song_is_under_two_seconds_away(
        existing_playback: list[dict[str, Any]], increment_now: increment_now_callable, fixed_track_length_ms: int,
        valid_token_header: Headers, requests_client: Mock, get_query_parameter: get_query_parameter_callable,
        run_scheduling_job: run_scheduling_job_awaitable):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    await run_scheduling_job()
    actual_call = requests_client.post.call_args
    assert actual_call.args[0].startswith("https://api.spotify.com/v1/me/player/queue")
    called_uri = get_query_parameter(actual_call.args[0], "uri")
    assert called_uri in [track["uri"] for track in existing_playback]
    assert actual_call.kwargs["headers"] == valid_token_header


@pytest.mark.asyncio
async def should_not_add_song_to_playback_if_state_next_song_is_over_two_seconds_away(
        existing_playback: list[dict[str, Any]], increment_now: increment_now_callable, fixed_track_length_ms: int,
        playback_service: PoolPlaybackServiceRaw, requests_client: Mock):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 3500)))
    await queue_next_songs(playback_service)
    actual_call = requests_client.post.call_args
    assert actual_call is None


@pytest.mark.asyncio
async def should_inactivate_sessions_for_logged_out_users(db_connection: ConnectionManager, logged_in_user_id: str,
                                                          playback_service: PoolPlaybackServiceRaw,
                                                          existing_playback: list[dict[str, Any]],
                                                          valid_token_header: Headers,
                                                          mock_token_holder: TokenHolder,
                                                          fixed_track_length_ms: int,
                                                          increment_now: increment_now_callable):
    mock_token_holder.log_out(valid_token_header["Authorization"])

    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    await queue_next_songs(playback_service)

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(
            select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user_id))

    assert not playback_state.is_active


@pytest.mark.asyncio
async def should_reactivate_inactive_playback_on_post_pool(
        db_connection: ConnectionManager, logged_in_user: User, playback_service: PoolPlaybackServiceRaw,
        requests_client_get_queue: MockResponseQueue, valid_token_header: Headers,
        mock_token_holder: TokenHolder, fixed_track_length_ms: int, increment_now: increment_now_callable,
        create_mock_track_search_result: mock_track_search_result_callable, existing_playback: list[dict[str, Any]],
        build_success_response: build_success_response_callable, auth_database_connection: AuthDatabaseConnection,
        create_pool_creation_data_json: create_pool_creation_data_json_callable, test_client: TestClient,
        primary_user_token: ParsedTokenResponse):
    mock_token_holder.log_out(valid_token_header["Authorization"])

    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    await queue_next_songs(playback_service)
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


def should_be_able_to_skip_song_with_skip_route(existing_playback: list[dict[str, Any]],
                                                valid_token_header: Headers,
                                                requests_client: Mock,
                                                skip_song: skip_song_callable,
                                                get_query_parameter: get_query_parameter_callable):
    skip_song(valid_token_header)

    actual_queue_call = requests_client.post.call_args_list[0]
    actual_skip_call = requests_client.post.call_args_list[1]
    assert actual_queue_call.args[0].startswith("https://api.spotify.com/v1/me/player/queue")
    called_uri = get_query_parameter(actual_queue_call.args[0], "uri")
    assert called_uri in [track["uri"] for track in existing_playback]
    assert actual_queue_call.kwargs["headers"] == valid_token_header
    assert actual_skip_call.args[0].startswith("https://api.spotify.com/v1/me/player/next")
    assert actual_skip_call.kwargs["headers"] == valid_token_header


def should_ensure_queue_is_empty_before_skipping_song(existing_playback: list[dict[str, Any]], requests_client: Mock,
                                                      valid_token_header: Headers, test_client: TestClient,
                                                      validate_response: validate_response_callable,
                                                      create_spotify_playback: create_spotify_playback_callable,
                                                      get_query_parameter: get_query_parameter_callable,
                                                      mock_empty_queue_get: BuildQueue):
    create_spotify_playback(50000, 1)
    mock_empty_queue_get()
    response = test_client.post("/pool/playback/skip", headers=valid_token_header)

    validate_response(response)
    assert len(requests_client.post.call_args_list) == 3
    actual_queue_call = requests_client.post.call_args_list[1]
    actual_skip_call = requests_client.post.call_args_list[2]
    assert actual_queue_call.args[0].startswith("https://api.spotify.com/v1/me/player/queue")
    called_uri = get_query_parameter(actual_queue_call.args[0], "uri")
    assert called_uri in [track["uri"] for track in existing_playback]
    assert actual_queue_call.kwargs["headers"] == valid_token_header
    assert actual_skip_call.args[0].startswith("https://api.spotify.com/v1/me/player/next")
    assert actual_skip_call.kwargs["headers"] == valid_token_header


def should_return_token_in_headers_for_skip_route(existing_playback: list[dict[str, Any]],
                                                  valid_token_header: Headers,
                                                  skip_song: skip_song_callable,
                                                  assert_token_in_headers: assert_token_in_headers_callable):
    response = skip_song(valid_token_header)
    assert_token_in_headers(response)


@pytest.mark.asyncio
async def should_defer_skip_if_spotify_not_close_to_song_end(requests_client: Mock, fixed_track_length_ms: int,
                                                             run_scheduling_job: run_scheduling_job_awaitable,
                                                             existing_playback: list[dict[str, Any]],
                                                             increment_now: increment_now_callable,
                                                             create_spotify_playback: create_spotify_playback_callable):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(5000)
    await run_scheduling_job()
    assert len(requests_client.post.call_args_list) == 0


@pytest.mark.asyncio
async def should_update_playback_end_time_in_db_after_defer(run_scheduling_job: run_scheduling_job_awaitable,
                                                            fixed_track_length_ms: int,
                                                            increment_now: increment_now_callable,
                                                            existing_playback: list[dict[str, Any]],
                                                            db_connection: ConnectionManager,
                                                            create_spotify_playback: create_spotify_playback_callable,
                                                            mock_datetime_wrapper: MockDateTimeWrapper):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    expected_end_time = create_spotify_playback(5000)
    await run_scheduling_job()

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(select(PlaybackSession))

    actual_timestamp = mock_datetime_wrapper.ensure_utc(playback_state.next_song_change_timestamp)
    assert actual_timestamp == ApproxDatetime(expected_end_time)


@pytest.mark.asyncio
async def should_correct_playback_time_based_on_spotify_status(
        run_scheduling_job: run_scheduling_job_awaitable, create_spotify_playback: create_spotify_playback_callable,
        existing_playback: list[dict[str, Any]], mock_datetime_wrapper: MockDateTimeWrapper, requests_client: Mock,
        increment_now: increment_now_callable, db_connection: ConnectionManager, fixed_track_length_ms: int):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 50)))
    expected_end_time = create_spotify_playback(1950) + datetime.timedelta(milliseconds=fixed_track_length_ms)
    await run_scheduling_job()

    assert len(requests_client.post.call_args_list) == 1

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(select(PlaybackSession))

    actual_timestamp = mock_datetime_wrapper.ensure_utc(playback_state.next_song_change_timestamp)
    assert actual_timestamp == ApproxDatetime(expected_end_time)


@pytest.mark.asyncio
async def should_fix_playback_data_if_playing_song_has_changed(
        run_scheduling_job: run_scheduling_job_awaitable, fixed_track_length_ms: int, db_connection: ConnectionManager,
        increment_now: increment_now_callable, existing_playback: list[dict[str, Any]],
        mock_datetime_wrapper: MockDateTimeWrapper, create_spotify_playback: create_spotify_playback_callable,
        create_mock_track_search_result: mock_track_search_result_callable, requests_client: Mock):
    new_track_data = create_mock_track_search_result()
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    expected_end_time = create_spotify_playback(20000, 0, new_track_data)
    await run_scheduling_job()
    assert len(requests_client.post.call_args_list) == 0

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(select(PlaybackSession))

    assert playback_state.current_track_uri == new_track_data["uri"]
    actual_change_timestamp = mock_datetime_wrapper.ensure_utc(playback_state.next_song_change_timestamp)
    assert actual_change_timestamp == ApproxDatetime(expected_end_time)


@pytest.mark.asyncio
async def should_empty_queue_if_songs_in_queue_on_song_change(requests_client: Mock,
                                                              run_scheduling_job: run_scheduling_job_awaitable,
                                                              fixed_track_length_ms: int,
                                                              existing_playback: list[dict[str, Any]],
                                                              increment_now: increment_now_callable,
                                                              create_spotify_playback: create_spotify_playback_callable,
                                                              mock_empty_queue_get: BuildQueue):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(500, 5)
    mock_empty_queue_get()
    await run_scheduling_job()
    # 5 for skipping queue, 1 for queueing the correct song, 1 for skipping to the queued song
    assert len(requests_client.post.call_args_list) == 7


@pytest.mark.asyncio
async def should_handle_songs_added_to_queue_during_queue_fix(requests_client: Mock,
                                                              run_scheduling_job: run_scheduling_job_awaitable,
                                                              fixed_track_length_ms: int,
                                                              existing_playback: list[dict[str, Any]],
                                                              increment_now: increment_now_callable,
                                                              create_spotify_playback: create_spotify_playback_callable,
                                                              mock_empty_queue_get: BuildQueue,
                                                              mock_filled_queue_get: mock_filled_queue_get_callable):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(500, 3)
    mock_filled_queue_get()
    mock_empty_queue_get()
    await run_scheduling_job()
    # 4 for skipping queue, 1 for queueing the correct song, 1 for skipping to the queued song
    assert len(requests_client.post.call_args_list) == 6


@pytest.mark.asyncio
async def should_correctly_skip_next_song_after_user_changes_song(
        run_scheduling_job: run_scheduling_job_awaitable, increment_now: increment_now_callable, requests_client: Mock,
        create_mock_track_search_result: mock_track_search_result_callable, fixed_track_length_ms: int,
        create_spotify_playback: create_spotify_playback_callable, existing_playback: list[dict[str, Any]]):
    new_track_data = create_mock_track_search_result()
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(20000, None, new_track_data)
    await run_scheduling_job()

    increment_now(datetime.timedelta(milliseconds=20000))
    create_spotify_playback(1000, 0, new_track_data)
    await run_scheduling_job()
    assert len(requests_client.post.call_args_list) == 1


@pytest.mark.asyncio
async def should_end_playback_on_no_active_player_when_queueing_next_song(
        existing_playback: list[dict[str, Any]], increment_now: increment_now_callable, fixed_track_length_ms: int,
        db_connection: ConnectionManager, valid_token_header: Headers, requests_client: Mock,
        mock_no_player_playback_state_response: mock_no_player_state_response_callable,
        run_scheduling_job: run_scheduling_job_awaitable):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_no_player_playback_state_response()

    await run_scheduling_job()

    with db_connection.session() as session:
        assert session.scalar(select(PlaybackSession)) is None
        assert session.scalar(select(Pool)) is None


def should_raise_error_on_no_active_player_when_skipping_song(
        existing_playback: list[dict[str, Any]], increment_now: increment_now_callable, fixed_track_length_ms: int,
        db_connection: ConnectionManager, valid_token_header: Headers, requests_client: Mock,
        mock_no_player_playback_state_response: mock_no_player_state_response_callable, skip_song: skip_song_callable,
        validate_response: validate_response_callable):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_no_player_playback_state_response()

    response = skip_song(valid_token_header)

    data_json = validate_response(response, 400)
    assert data_json["detail"] == "Could not find active playback"


@pytest.mark.asyncio
async def should_end_playback_on_playback_paused_when_queueing_next_song(
        increment_now: increment_now_callable, valid_token_header: Headers, db_connection: ConnectionManager,
        fixed_track_length_ms: int, requests_client: Mock, run_scheduling_job: run_scheduling_job_awaitable,
        existing_playback: list[dict[str, Any]], mock_playback_paused_response: mock_playback_paused_response_callable):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_playback_paused_response()

    await run_scheduling_job()

    with db_connection.session() as session:
        assert session.scalar(select(PlaybackSession)) is None
        assert session.scalar(select(Pool)) is None


def should_raise_error_on_playback_paused_when_skipping_song(
        existing_playback: list[dict[str, Any]], increment_now: increment_now_callable, fixed_track_length_ms: int,
        valid_token_header: Headers, mock_playback_paused_response: mock_playback_paused_response_callable,
        skip_song: skip_song_callable, validate_response: validate_response_callable):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_playback_paused_response()

    response = skip_song(valid_token_header)

    data_json = validate_response(response, 400)
    assert data_json["detail"] == "Your playback is paused, please resume playback to continue using Stagnum!"


@pytest.mark.asyncio
async def should_end_playback_on_playback_context_changed_when_queueing_next_song(
        increment_now: increment_now_callable, run_scheduling_job: run_scheduling_job_awaitable,
        db_connection: ConnectionManager, fixed_track_length_ms: int, existing_playback: list[dict[str, Any]],
        create_spotify_playback: create_spotify_playback_callable):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    context = {
        "type": "playlist",
        "href": "https://example.playlist.href",
        "external_urls": {
            "spotify": "https://open.spotify.example/playlist/href"
        },
        "uri": "spotify:playlist:example_uri"
    }
    create_spotify_playback(1000, 0, None, context)

    await run_scheduling_job()

    with db_connection.session() as session:
        assert session.scalar(select(PlaybackSession)) is None
        assert session.scalar(select(Pool)) is None


def should_raise_error_on_skip_on_playback_context_changed(existing_playback: list[dict[str, Any]],
                                                           increment_now: increment_now_callable,
                                                           fixed_track_length_ms: int, skip_song: skip_song_callable,
                                                           valid_token_header: Headers,
                                                           create_spotify_playback: create_spotify_playback_callable,
                                                           validate_response: validate_response_callable):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    context = {
        "type": "playlist",
        "href": "https://example.playlist.href",
        "external_urls": {
            "spotify": "https://open.spotify.example/playlist/href"
        },
        "uri": "spotify:playlist:example_uri"
    }
    create_spotify_playback(1000, 0, None, context)

    response = skip_song(valid_token_header)

    data_json = validate_response(response, 400)
    assert data_json["detail"] == ("Spotify playback moved to another context outside Stagnum control! Please restart "
                                   "playback from Stagnum by creating another pool.")
