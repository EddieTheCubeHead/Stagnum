import datetime

import pytest

from api.pool import queue_next_songs


@pytest.mark.asyncio
async def should_send_update_when_scheduled_queue_job_updates_playback(test_client, existing_playback,
                                                                       fixed_track_length_ms,
                                                                       increment_now, run_scheduling_job,
                                                                       valid_token):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    with test_client.websocket_connect(f"/pool/playback/register_listener?Authorization={valid_token}") as websocket:
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
    with test_client.websocket_connect(f"/pool/playback/register_listener?Authorization={valid_token}") as websocket:
        response = skip_song(another_logged_in_user_header)
        result = validate_response(response)
        data = websocket.receive_json()
        assert data["type"] == "model"
        assert data["model"] == result


@pytest.mark.asyncio
async def should_send_queue_not_empty_error_through_websocket_on_scheduled_job(test_client, existing_playback,
                                                                               valid_token, shared_pool_code,
                                                                               playback_service, fixed_track_length_ms,
                                                                               another_logged_in_user_header,
                                                                               create_skippable_spotify_playback,
                                                                               increment_now):
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    create_skippable_spotify_playback(1)
    with test_client.websocket_connect(f"/pool/playback/register_listener?Authorization={valid_token}") as websocket:
        await queue_next_songs(playback_service)
        data = websocket.receive_json()
        assert data["type"] == "error"
        expected_message = ("Songs detected in Spotify queue! Please ensure your queue is empty by skipping in Spotify "
                            "until the player repeats one song. Then reset Stagnum playback status by skipping a song "
                            "in Stagnum. We are sorry for the inconvenience, Spotify does not offer tools for us to do "
                            "this automatically.")
        assert data["model"]["detail"] == expected_message
