import datetime
import random

import pytest

from api.pool import queue_next_songs
from api.pool.models import PoolContent


def should_get_update_when_pool_contents_added(test_client, valid_token_header, shared_pool_code, logged_in_user_id,
                                               another_logged_in_user_header, build_success_response,
                                               create_mock_playlist_fetch_result, requests_client_get_queue,
                                               another_logged_in_user_token):
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


def should_get_update_when_pool_contents_deleted(test_client, valid_token_header, shared_pool_code,
                                                 another_logged_in_user_header, logged_in_user_id, existing_playback,
                                                 another_logged_in_user_token):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={another_logged_in_user_token}") as websocket:
        deleted_song = random.choice(existing_playback)
        test_client.delete(f"/pool/content/{deleted_song["uri"]}", headers=valid_token_header)
        data = websocket.receive_json()
        for user_data in data["model"]["users"]:
            if user_data["user"]["spotify_id"] == logged_in_user_id:
                assert len(user_data["tracks"]) == len(existing_playback) - 1


def should_get_update_when_user_joins_pool(test_client, valid_token, shared_pool_code, existing_playback,
                                           another_logged_in_user_header):
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
        data = websocket.receive_json()
        assert len(data["model"]["users"]) == 2


@pytest.mark.asyncio
async def should_send_update_when_scheduled_queue_job_updates_playback(test_client, existing_playback,
                                                                       fixed_track_length_ms,
                                                                       increment_now, run_scheduling_job,
                                                                       valid_token):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        await run_scheduling_job()
        data = websocket.receive_json()
        model_data = data["model"]
        assert model_data["name"] in [track["name"] for track in existing_playback]
        assert model_data["spotify_icon_uri"] in [track["album"]["images"][0]["url"] for track in existing_playback]
        assert model_data["spotify_track_uri"] in [track["uri"] for track in existing_playback]
        assert model_data["duration_ms"] == fixed_track_length_ms


def should_send_update_when_other_user_in_pool_skips(test_client, existing_playback, another_logged_in_user_header,
                                                     valid_token, shared_pool_code, validate_response, skip_song):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        response = skip_song(another_logged_in_user_header)
        result = validate_response(response)
        data = websocket.receive_json()
        assert data["type"] == "current_track"
        assert data["model"] == result


@pytest.mark.asyncio
async def should_send_next_song_data_even_after_fixing_queue(test_client, existing_playback, valid_token,
                                                             shared_pool_code, playback_service, fixed_track_length_ms,
                                                             another_logged_in_user_header, create_spotify_playback,
                                                             increment_now, mock_empty_queue_get):
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
async def should_notify_socket_if_playback_fix_occurs(run_scheduling_job, fixed_track_length_ms, increment_now,
                                                      existing_playback, create_spotify_playback, test_client,
                                                      create_mock_track_search_result, valid_token):
    new_track_data = create_mock_track_search_result()
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    create_spotify_playback(20000, 0, new_track_data)
    with test_client.websocket_connect(f"/websocket/connect?Authorization={valid_token}") as websocket:
        await run_scheduling_job()
        data = websocket.receive_json()
        assert data["type"] == "current_track"
        assert data["model"]["spotify_track_uri"] == new_track_data["uri"]

