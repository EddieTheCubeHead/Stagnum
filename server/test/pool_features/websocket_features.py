import datetime
import random

import pytest
from starlette.testclient import TestClient

from api.pool import queue_next_songs
from api.pool.dependencies import PoolPlaybackServiceRaw
from api.pool.models import PoolContent
from test_types.callables import BuildSuccessResponse, MockPlaylistFetchResult, \
    IncrementNow, RunSchedulingJob, ValidateResponse, SkipSong, \
    CreateSpotifyPlayback, BuildQueue, MockTrackSearchResult
from test_types.typed_dictionaries import Headers, TrackData
from test_types.aliases import MockResponseQueue


def should_get_update_when_pool_contents_added(test_client: TestClient, valid_token_header: Headers,
                                               shared_pool_code: str, logged_in_user_id: str,
                                               another_logged_in_user_header: Headers,
                                               build_success_response: BuildSuccessResponse,
                                               create_mock_playlist_fetch_result: MockPlaylistFetchResult,
                                               requests_client_get_queue: MockResponseQueue,
                                               another_logged_in_user_token: Headers):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={another_logged_in_user_token}") as websocket:
        playlist = create_mock_playlist_fetch_result(15)
        requests_client_get_queue.append(build_success_response(playlist))
        pool_content_data = PoolContent(spotify_uri=playlist["uri"]).model_dump()
        test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)
        data = websocket.receive_json()
        for user_data in data["model"]["users"]:
            if user_data["user"]["spotify_id"] == logged_in_user_id:
                assert len(user_data["collections"]) == 1


def should_get_update_when_pool_contents_deleted(test_client: TestClient, valid_token_header: Headers,
                                                 shared_pool_code: str, another_logged_in_user_header: Headers,
                                                 logged_in_user_id: str, existing_playback: list[TrackData],
                                                 another_logged_in_user_token: str):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={another_logged_in_user_token}") as websocket:
        deleted_song = random.choice(existing_playback)
        test_client.delete(f"/pool/content/{deleted_song["uri"]}", headers=valid_token_header)
        data = websocket.receive_json()
        for user_data in data["model"]["users"]:
            if user_data["user"]["spotify_id"] == logged_in_user_id:
                assert len(user_data["tracks"]) == len(existing_playback) - 1


def should_get_update_when_user_joins_pool(test_client: TestClient, valid_token: str, shared_pool_code: str,
                                           existing_playback: list[TrackData], another_logged_in_user_header: Headers):
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
        data = websocket.receive_json()
        assert len(data["model"]["users"]) == 2


@pytest.mark.asyncio
async def should_send_update_when_scheduled_queue_job_updates_playback(
        test_client: TestClient, existing_playback: list[TrackData], fixed_track_length_ms: int, valid_token: str,
        increment_now: IncrementNow, run_scheduling_job: RunSchedulingJob):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        await run_scheduling_job()
        data = websocket.receive_json()
        model_data = data["model"]
        assert model_data["name"] in [track["name"] for track in existing_playback]
        assert model_data["spotify_icon_uri"] in [track["album"]["images"][0]["url"] for track in existing_playback]
        assert model_data["spotify_track_uri"] in [track["uri"] for track in existing_playback]
        assert model_data["duration_ms"] == fixed_track_length_ms


def should_send_update_when_other_user_in_pool_skips(test_client: TestClient, existing_playback: list[TrackData],
                                                     another_logged_in_user_header: Headers, valid_token: str,
                                                     shared_pool_code: str, skip_song: SkipSong,
                                                     validate_response: ValidateResponse):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        response = skip_song(another_logged_in_user_header)
        result = validate_response(response)
        data = websocket.receive_json()
        assert data["type"] == "current_track"
        assert data["model"] == result


@pytest.mark.asyncio
async def should_send_next_song_data_even_after_fixing_queue(test_client: TestClient, shared_pool_code: str,
                                                             existing_playback: list[TrackData], valid_token: str,
                                                             playback_service: PoolPlaybackServiceRaw,
                                                             fixed_track_length_ms: int,
                                                             another_logged_in_user_header: Headers,
                                                             create_spotify_playback: CreateSpotifyPlayback,
                                                             increment_now: IncrementNow,
                                                             mock_empty_queue_get: BuildQueue):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    create_spotify_playback(500, 1)
    mock_empty_queue_get()
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        await queue_next_songs(playback_service)
        data = websocket.receive_json()
        assert data["type"] == "current_track"
        assert data["model"]


@pytest.mark.asyncio
async def should_notify_socket_if_playback_fix_occurs(
        run_scheduling_job: RunSchedulingJob, fixed_track_length_ms: int,
        increment_now: IncrementNow, existing_playback: list[TrackData], test_client: TestClient,
        create_spotify_playback: CreateSpotifyPlayback, valid_token: str,
        create_mock_track_search_result: MockTrackSearchResult):
    new_track_data = create_mock_track_search_result()
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(20000, 0, new_track_data)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        await run_scheduling_job()
        data = websocket.receive_json()
        assert data["type"] == "current_track"
        assert data["model"]["spotify_track_uri"] == new_track_data["uri"]


def should_wipe_pool_for_listeners_on_pool_delete(test_client: TestClient, existing_playback: list[TrackData],
                                                  another_logged_in_user_token: str, valid_token_header: Headers,
                                                  another_logged_in_user_header: Headers, shared_pool_code: str):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={another_logged_in_user_token}") as websocket:
        test_client.delete("/pool", headers=valid_token_header)
        data = websocket.receive_json()
        assert data["type"] == "pool"
        assert data["model"]["users"] == []
        assert data["model"]["currently_playing"] is None
        assert data["model"]["share_code"] is None


def should_wipe_leavers_songs_on_pool_leave(test_client: TestClient, existing_playback: list[TrackData],
                                            shared_pool_code: str, requests_client_get_queue: MockResponseQueue,
                                            another_logged_in_user_header: Headers, valid_token: str,
                                            build_success_response: BuildSuccessResponse,
                                            create_mock_playlist_fetch_result: MockPlaylistFetchResult):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    playlist = create_mock_playlist_fetch_result(35)
    requests_client_get_queue.append(build_success_response(playlist))
    pool_content_data = PoolContent(spotify_uri=playlist["uri"]).model_dump()
    test_client.post("/pool/content", json=pool_content_data, headers=another_logged_in_user_header)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        test_client.post("/pool/leave", headers=another_logged_in_user_header)
        data = websocket.receive_json()
        assert data["type"] == "pool"
        assert len(data["model"]["users"]) == 1

