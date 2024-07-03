import datetime
from typing import Any
from unittest.mock import Mock

import pytest
from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import TokenHolder
from api.common.models import ParsedTokenResponse
from api.common.spotify_models import TrackData
from api.pool.dependencies import PoolPlaybackServiceRaw
from api.pool.models import PoolFullContents
from api.pool.spotify_models import PlaybackContextData
from api.pool.tasks import queue_next_songs
from database.database_connection import ConnectionManager
from database.entities import PlaybackSession, Pool, User
from helpers.classes import ApproxDatetime, MockDateTimeWrapper, MockedPoolContents
from sqlalchemy import select
from starlette.testclient import TestClient
from test_types.callables import (
    AssertEmptyTables,
    AssertPlaybackStarted,
    AssertTokenInHeaders,
    BuildQueue,
    CreatePool,
    CreateSpotifyPlayback,
    GetQueryParameter,
    IncrementNow,
    MockNoPlayerStateResponse,
    MockPlaybackPausedResponse,
    MockTrackSearchResult,
    RunSchedulingJob,
    SkipSong,
    ValidateErrorResponse,
    ValidateModel,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers


@pytest.fixture
def assert_playback_started(requests_client: Mock) -> AssertPlaybackStarted:
    def wrapper(uris: list[str]) -> None:
        actual_call = requests_client.put.call_args
        assert actual_call.args[0] == "https://api.spotify.com/v1/me/player/play"
        assert actual_call.kwargs["json"]["position_ms"] == 0
        call_uri = actual_call.kwargs["json"]["uris"][0]
        assert call_uri in uris

    return wrapper


@pytest.fixture
def invalid_playback_context() -> PlaybackContextData:
    return {
        "type": "playlist",
        "href": "https://example.playlist.href",
        "external_urls": {"spotify": "https://open.spotify.example/playlist/href"},
        "uri": "spotify:playlist:example_uri",
    }


def should_start_pool_playback_from_tracks_when_posting_new_pool_from_tracks(
    mocked_pool_contents: MockedPoolContents, create_pool: CreatePool, assert_playback_started: AssertPlaybackStarted
) -> None:
    create_pool(tracks=15)

    track_uris = [track["uri"] for track in mocked_pool_contents.tracks]
    assert_playback_started(track_uris)


def should_start_pool_playback_from_collection_tracks_when_posting_collection(
    create_pool: CreatePool, mocked_pool_contents: MockedPoolContents, assert_playback_started: AssertPlaybackStarted
) -> None:
    create_pool(playlists=[25])

    playlist = mocked_pool_contents.playlist.first_fetch
    # Forced to do it like this because of type checking...
    tracks: list[TrackData] = [track["track"] for track in playlist["tracks"]["items"] if track["track"] is not None]
    expected_track_uris = [track["uri"] for track in tracks]
    assert_playback_started(expected_track_uris)


@pytest.mark.slow
@pytest.mark.parametrize("_", range(15))
def should_not_start_pool_playback_from_collection_uri_when_posting_collection(
    create_pool: CreatePool,
    mocked_pool_contents: MockedPoolContents,
    assert_playback_started: AssertPlaybackStarted,
    _: int,
) -> None:
    # use only one track so test fails with repeats if main collection is ever used
    create_pool(playlists=[1])

    track = mocked_pool_contents.playlist.first_fetch["tracks"]["items"][0]["track"]
    assert track is not None
    assert_playback_started([track["uri"]])


def should_save_next_track_change_time_on_playback_start(
    logged_in_user_id: str,
    db_connection: ConnectionManager,
    mock_datetime_wrapper: MockDateTimeWrapper,
    create_pool: CreatePool,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    start_time = mock_datetime_wrapper.now()

    create_pool(tracks=1)

    track = mocked_pool_contents.track
    with db_connection.session() as session:
        playback_session = session.scalar(select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user_id))
    expected_end_time = start_time + datetime.timedelta(milliseconds=track["duration_ms"])
    actual_end_time = mock_datetime_wrapper.ensure_utc(playback_session.next_song_change_timestamp)
    assert actual_end_time == ApproxDatetime(expected_end_time, datetime.timedelta(milliseconds=500))


@pytest.mark.asyncio
async def should_add_song_to_playback_if_state_next_song_is_under_two_seconds_away(
    existing_playback: list[TrackData],
    increment_now: IncrementNow,
    fixed_track_length_ms: int,
    valid_token_header: Headers,
    requests_client: Mock,
    get_query_parameter: GetQueryParameter,
    run_scheduling_job: RunSchedulingJob,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))

    await run_scheduling_job()

    actual_call = requests_client.post.call_args
    assert actual_call.args[0].startswith("https://api.spotify.com/v1/me/player/queue")
    called_uri = get_query_parameter(actual_call.args[0], "uri")
    assert called_uri in [track["uri"] for track in existing_playback]
    assert actual_call.kwargs["headers"] == valid_token_header


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_not_add_song_to_playback_if_state_next_song_is_over_two_seconds_away(
    increment_now: IncrementNow,
    fixed_track_length_ms: int,
    playback_service: PoolPlaybackServiceRaw,
    requests_client: Mock,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 3500)))

    await queue_next_songs(playback_service)

    actual_call = requests_client.post.call_args
    assert actual_call is None


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_inactivate_sessions_for_logged_out_users(
    db_connection: ConnectionManager,
    logged_in_user_id: str,
    playback_service: PoolPlaybackServiceRaw,
    valid_token_header: Headers,
    mock_token_holder: TokenHolder,
    fixed_track_length_ms: int,
    increment_now: IncrementNow,
) -> None:
    mock_token_holder.log_out(valid_token_header["Authorization"])
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))

    await queue_next_songs(playback_service)

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(
            select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user_id)
        )
    assert not playback_state.is_active


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_reactivate_inactive_playback_on_post_pool(
    db_connection: ConnectionManager,
    logged_in_user: User,
    playback_service: PoolPlaybackServiceRaw,
    valid_token_header: Headers,
    mock_token_holder: TokenHolder,
    fixed_track_length_ms: int,
    increment_now: IncrementNow,
    auth_database_connection: AuthDatabaseConnection,
    primary_user_token: ParsedTokenResponse,
    create_pool: CreatePool,
) -> None:
    mock_token_holder.log_out(valid_token_header["Authorization"])
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    await queue_next_songs(playback_service)
    auth_database_connection.update_logged_in_user(logged_in_user, primary_user_token)

    create_pool(tracks=1)

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(
            select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user.spotify_id)
        )
    assert playback_state.is_active


def should_be_able_to_skip_song_with_skip_route(
    existing_playback: list[dict[str, Any]],
    valid_token_header: Headers,
    requests_client: Mock,
    skip_song: SkipSong,
    get_query_parameter: GetQueryParameter,
) -> None:
    skip_song(valid_token_header)

    actual_queue_call = requests_client.post.call_args_list[0]
    actual_skip_call = requests_client.post.call_args_list[1]
    assert actual_queue_call.args[0].startswith("https://api.spotify.com/v1/me/player/queue")
    called_uri = get_query_parameter(actual_queue_call.args[0], "uri")
    assert called_uri in [track["uri"] for track in existing_playback]
    assert actual_queue_call.kwargs["headers"] == valid_token_header
    assert actual_skip_call.args[0].startswith("https://api.spotify.com/v1/me/player/next")
    assert actual_skip_call.kwargs["headers"] == valid_token_header


def should_ensure_queue_is_empty_before_skipping_song(
    existing_playback: list[dict[str, Any]],
    requests_client: Mock,
    valid_token_header: Headers,
    test_client: TestClient,
    validate_response: ValidateResponse,
    create_spotify_playback: CreateSpotifyPlayback,
    get_query_parameter: GetQueryParameter,
    mock_empty_queue_get: BuildQueue,
) -> None:
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


@pytest.mark.usefixtures("existing_playback")
def should_return_token_in_headers_for_skip_route(
    valid_token_header: Headers, skip_song: SkipSong, assert_token_in_headers: AssertTokenInHeaders
) -> None:
    response = skip_song(valid_token_header)
    assert_token_in_headers(response)


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_defer_skip_if_spotify_not_close_to_song_end(
    requests_client: Mock,
    fixed_track_length_ms: int,
    run_scheduling_job: RunSchedulingJob,
    increment_now: IncrementNow,
    create_spotify_playback: CreateSpotifyPlayback,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(5000)

    await run_scheduling_job()

    assert len(requests_client.post.call_args_list) == 0


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_update_playback_end_time_in_db_after_defer(
    run_scheduling_job: RunSchedulingJob,
    fixed_track_length_ms: int,
    increment_now: IncrementNow,
    db_connection: ConnectionManager,
    create_spotify_playback: CreateSpotifyPlayback,
    mock_datetime_wrapper: MockDateTimeWrapper,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    expected_end_time = create_spotify_playback(5000)

    await run_scheduling_job()

    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(select(PlaybackSession))
    actual_timestamp = mock_datetime_wrapper.ensure_utc(playback_state.next_song_change_timestamp)
    assert actual_timestamp == ApproxDatetime(expected_end_time)


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_correct_playback_time_based_on_spotify_status(
    run_scheduling_job: RunSchedulingJob,
    create_spotify_playback: CreateSpotifyPlayback,
    mock_datetime_wrapper: MockDateTimeWrapper,
    requests_client: Mock,
    increment_now: IncrementNow,
    db_connection: ConnectionManager,
    fixed_track_length_ms: int,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 50)))
    expected_end_time = create_spotify_playback(1950) + datetime.timedelta(milliseconds=fixed_track_length_ms)

    await run_scheduling_job()

    assert len(requests_client.post.call_args_list) == 1
    with db_connection.session() as session:
        playback_state: PlaybackSession = session.scalar(select(PlaybackSession))
    actual_timestamp = mock_datetime_wrapper.ensure_utc(playback_state.next_song_change_timestamp)
    assert actual_timestamp == ApproxDatetime(expected_end_time)


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_fix_playback_data_if_playing_song_has_changed(
    run_scheduling_job: RunSchedulingJob,
    fixed_track_length_ms: int,
    db_connection: ConnectionManager,
    increment_now: IncrementNow,
    mock_datetime_wrapper: MockDateTimeWrapper,
    create_spotify_playback: CreateSpotifyPlayback,
    create_mock_track_search_result: MockTrackSearchResult,
    requests_client: Mock,
) -> None:
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
@pytest.mark.usefixtures("existing_playback")
async def should_empty_queue_if_songs_in_queue_on_song_change(
    requests_client: Mock,
    run_scheduling_job: RunSchedulingJob,
    fixed_track_length_ms: int,
    increment_now: IncrementNow,
    create_spotify_playback: CreateSpotifyPlayback,
    mock_empty_queue_get: BuildQueue,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(500, 5)
    mock_empty_queue_get()

    await run_scheduling_job()

    # 5 for skipping queue, 1 for queueing the correct song, 1 for skipping to the queued song
    assert len(requests_client.post.call_args_list) == 7


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_handle_songs_added_to_queue_during_queue_fix(
    requests_client: Mock,
    run_scheduling_job: RunSchedulingJob,
    fixed_track_length_ms: int,
    increment_now: IncrementNow,
    create_spotify_playback: CreateSpotifyPlayback,
    mock_empty_queue_get: BuildQueue,
    mock_filled_queue_get: BuildQueue,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(500, 3)
    mock_filled_queue_get()
    mock_empty_queue_get()

    await run_scheduling_job()

    # 4 for skipping queue, 1 for queueing the correct song, 1 for skipping to the queued song
    assert len(requests_client.post.call_args_list) == 6


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_correctly_skip_next_song_after_user_changes_song(
    run_scheduling_job: RunSchedulingJob,
    increment_now: IncrementNow,
    requests_client: Mock,
    create_mock_track_search_result: MockTrackSearchResult,
    fixed_track_length_ms: int,
    create_spotify_playback: CreateSpotifyPlayback,
) -> None:
    new_track_data = create_mock_track_search_result()
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(20000, None, new_track_data)
    await run_scheduling_job()
    increment_now(datetime.timedelta(milliseconds=20000))
    create_spotify_playback(1000, 0, new_track_data)

    await run_scheduling_job()

    assert len(requests_client.post.call_args_list) == 1


@pytest.mark.usefixtures("existing_playback")
def should_return_pool_in_paused_state_after_posting_pause_playback(
    test_client: TestClient, validate_model: ValidateModel, valid_token_header: Headers
) -> None:
    response = test_client.post("/pool/playback/pause", headers=valid_token_header)
    pool = validate_model(PoolFullContents, response)
    assert not pool.is_active


@pytest.mark.usefixtures("existing_playback")
def should_pause_spotify_player_on_playback_pause(
    test_client: TestClient, requests_client: Mock, valid_token_header: Headers
) -> None:
    test_client.post("/pool/playback/pause", headers=valid_token_header)

    assert requests_client.put.call_args[0][0] == "https://api.spotify.com/v1/me/player/pause"


@pytest.mark.usefixtures("paused_playback")
def should_return_pool_in_playing_state_after_posting_resume_playback(
    test_client: TestClient, validate_model: ValidateModel, valid_token_header: Headers
) -> None:
    response = test_client.post("/pool/playback/resume", headers=valid_token_header)
    pool = validate_model(PoolFullContents, response)
    assert pool.is_active


@pytest.mark.wip
def should_start_playback_from_random_song_on_resuming_paused_playback(
    test_client: TestClient,
    valid_token_header: Headers,
    assert_playback_started: AssertPlaybackStarted,
    paused_playback: list[TrackData],
) -> None:
    test_client.post("/pool/playback/resume", headers=valid_token_header)

    track_uris = [track["uri"] for track in paused_playback]
    assert_playback_started(track_uris)


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_end_playback_on_no_active_player_when_queueing_next_song(
    increment_now: IncrementNow,
    fixed_track_length_ms: int,
    mock_no_player_playback_state_response: MockNoPlayerStateResponse,
    assert_empty_tables: AssertEmptyTables,
    run_scheduling_job: RunSchedulingJob,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_no_player_playback_state_response()

    await run_scheduling_job()

    assert_empty_tables(PlaybackSession, Pool)


@pytest.mark.usefixtures("existing_playback")
def should_raise_error_on_no_active_player_when_skipping_song(
    increment_now: IncrementNow,
    fixed_track_length_ms: int,
    valid_token_header: Headers,
    mock_no_player_playback_state_response: MockNoPlayerStateResponse,
    skip_song: SkipSong,
    validate_error_response: ValidateErrorResponse,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_no_player_playback_state_response()

    response = skip_song(valid_token_header)

    validate_error_response(response, 400, "Could not find active playback")


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_end_playback_on_playback_paused_when_queueing_next_song(
    increment_now: IncrementNow,
    fixed_track_length_ms: int,
    run_scheduling_job: RunSchedulingJob,
    mock_playback_paused_response: MockPlaybackPausedResponse,
    assert_empty_tables: AssertEmptyTables,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_playback_paused_response()

    await run_scheduling_job()

    assert_empty_tables(PlaybackSession, Pool)


@pytest.mark.usefixtures("existing_playback")
def should_raise_error_on_playback_paused_when_skipping_song(
    increment_now: IncrementNow,
    fixed_track_length_ms: int,
    valid_token_header: Headers,
    mock_playback_paused_response: MockPlaybackPausedResponse,
    skip_song: SkipSong,
    validate_error_response: ValidateErrorResponse,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_playback_paused_response()

    response = skip_song(valid_token_header)

    validate_error_response(response, 400, "Your playback is paused, please resume playback to continue using Stagnum!")


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_end_playback_on_playback_context_changed_when_queueing_next_song(
    increment_now: IncrementNow,
    run_scheduling_job: RunSchedulingJob,
    assert_empty_tables: AssertEmptyTables,
    fixed_track_length_ms: int,
    create_spotify_playback: CreateSpotifyPlayback,
    invalid_playback_context: PlaybackContextData,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(1000, 0, None, invalid_playback_context)

    await run_scheduling_job()

    assert_empty_tables(PlaybackSession, Pool)


@pytest.mark.usefixtures("existing_playback")
def should_raise_error_on_skip_on_playback_context_changed(
    increment_now: IncrementNow,
    fixed_track_length_ms: int,
    skip_song: SkipSong,
    valid_token_header: Headers,
    invalid_playback_context: PlaybackContextData,
    create_spotify_playback: CreateSpotifyPlayback,
    validate_error_response: ValidateErrorResponse,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(1000, 0, None, invalid_playback_context)

    response = skip_song(valid_token_header)

    expected_error_message = (
        "Spotify playback moved to another context outside Stagnum control! Please restart "
        "playback from Stagnum by creating another pool."
    )
    validate_error_response(response, 400, expected_error_message)
