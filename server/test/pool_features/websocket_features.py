import datetime
import random

import pytest
from api.common.spotify_models import TrackData
from api.pool import queue_next_songs
from api.pool.dependencies import PoolPlaybackServiceRaw
from starlette.testclient import TestClient
from test_types.callables import (
    BuildQueue,
    CreateSpotifyPlayback,
    GetExistingPool,
    IncrementNow,
    MockPlaylistFetch,
    MockTrackSearchResult,
    RunSchedulingJob,
    SkipSong,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers


def should_get_update_when_pool_contents_added(
    test_client: TestClient,
    valid_token_header: Headers,
    logged_in_user_id: str,
    joined_user_token: str,
    mock_playlist_fetch: MockPlaylistFetch,
) -> None:
    with test_client.websocket_connect(f"/websocket/connect?Authorization={joined_user_token}") as websocket:
        pool_content_data = mock_playlist_fetch(15)
        test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)
        data = websocket.receive_json()
        for user_data in data["model"]["users"]:
            if user_data["user"]["spotify_id"] == logged_in_user_id:
                assert len(user_data["collections"]) == 1


@pytest.mark.usefixtures("existing_playback")
def should_get_update_when_pool_contents_deleted(
    test_client: TestClient,
    valid_token_header: Headers,
    joined_user_token: Headers,
    logged_in_user_id: str,
    get_existing_pool: GetExistingPool,
) -> None:
    existing_tracks = get_existing_pool().users[0].tracks
    with test_client.websocket_connect(f"/websocket/connect?Authorization={joined_user_token}") as websocket:
        deleted_song = random.choice(existing_tracks)
        test_client.delete(f"/pool/content/{deleted_song.id}", headers=valid_token_header)
        data = websocket.receive_json()
        for user_data in data["model"]["users"]:
            if user_data["user"]["spotify_id"] == logged_in_user_id:
                assert len(user_data["tracks"]) == len(existing_tracks) - 1


def should_get_update_when_user_joins_pool(
    test_client: TestClient, valid_token: str, shared_pool_code: str, another_logged_in_user_header: Headers
) -> None:
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
        data = websocket.receive_json()
        assert len(data["model"]["users"]) == 2


@pytest.mark.asyncio
async def should_send_update_when_scheduled_queue_job_updates_playback(
    test_client: TestClient,
    existing_playback: list[TrackData],
    fixed_track_length_ms: int,
    valid_token: str,
    increment_now: IncrementNow,
    run_scheduling_job: RunSchedulingJob,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        await run_scheduling_job()
        data = websocket.receive_json()
        model_data = data["model"]
        assert model_data["name"] in [track["name"] for track in existing_playback]
        assert model_data["spotify_icon_uri"] in [track["album"]["images"][0]["url"] for track in existing_playback]
        assert model_data["spotify_resource_uri"] in [track["uri"] for track in existing_playback]
        assert model_data["duration_ms"] == fixed_track_length_ms


def should_send_update_when_other_user_in_pool_skips(
    test_client: TestClient,
    joined_user_header: Headers,
    valid_token: str,
    skip_song: SkipSong,
    validate_response: ValidateResponse,
) -> None:
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        response = skip_song(joined_user_header)
        result = validate_response(response)
        data = websocket.receive_json()
        assert data["type"] == "current_track"
        assert data["model"] == result


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_send_next_song_data_even_after_fixing_queue(
    test_client: TestClient,
    valid_token: str,
    playback_service: PoolPlaybackServiceRaw,
    fixed_track_length_ms: int,
    create_spotify_playback: CreateSpotifyPlayback,
    increment_now: IncrementNow,
    mock_empty_queue_get: BuildQueue,
) -> None:
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(500, 1)
    mock_empty_queue_get()
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        await queue_next_songs(playback_service)
        data = websocket.receive_json()
        assert data["type"] == "current_track"
        assert data["model"]


@pytest.mark.asyncio
@pytest.mark.usefixtures("existing_playback")
async def should_notify_socket_if_playback_fix_occurs(
    run_scheduling_job: RunSchedulingJob,
    fixed_track_length_ms: int,
    increment_now: IncrementNow,
    test_client: TestClient,
    create_spotify_playback: CreateSpotifyPlayback,
    valid_token: str,
    create_mock_track_search_result: MockTrackSearchResult,
) -> None:
    new_track_data = create_mock_track_search_result()
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(20000, 0, new_track_data)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        await run_scheduling_job()
        data = websocket.receive_json()
        assert data["type"] == "current_track"
        assert data["model"]["spotify_resource_uri"] == new_track_data["uri"]


def should_wipe_pool_for_listeners_on_pool_delete(
    test_client: TestClient, joined_user_token: str, valid_token_header: Headers
) -> None:
    with test_client.websocket_connect(f"/websocket/connect?Authorization={joined_user_token}") as websocket:
        test_client.delete("/pool", headers=valid_token_header)
        data = websocket.receive_json()
        assert data["type"] == "pool"
        assert data["model"]["users"] == []
        assert data["model"]["currently_playing"] is None
        assert data["model"]["share_code"] is None


def should_wipe_leavers_songs_on_pool_leave(
    test_client: TestClient, joined_user_header: Headers, valid_token: str, mock_playlist_fetch: MockPlaylistFetch
) -> None:
    pool_content_data = mock_playlist_fetch(35)
    test_client.post("/pool/content", json=pool_content_data, headers=joined_user_header)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        test_client.post("/pool/leave", headers=joined_user_header)
        data = websocket.receive_json()
        assert data["type"] == "pool"
        assert len(data["model"]["users"]) == 1
