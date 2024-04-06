import datetime

import pytest


@pytest.mark.asyncio
async def should_send_update_when_scheduled_queue_job_updates_playback(test_client, existing_playback,
                                                                       fixed_track_length_ms,
                                                                       monkeypatch, run_scheduling_job,
                                                                       valid_token):
    delta_to_soon = datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000))
    soon = datetime.datetime.now() + delta_to_soon
    soon_utc = datetime.datetime.now(datetime.timezone.utc) + delta_to_soon

    class MockDateTime:
        @classmethod
        def now(cls, tz_info=None):
            return soon if tz_info is None else soon_utc

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    with test_client.websocket_connect(f"/pool/playback/register_listener?token={valid_token}") as websocket:
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
    with test_client.websocket_connect(f"/pool/playback/register_listener?token={valid_token}") as websocket:
        response = skip_song(another_logged_in_user_header)
        result = validate_response(response)
        data = websocket.receive_json()
        assert data["type"] == "model"
        assert data["model"] == result
