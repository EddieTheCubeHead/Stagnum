import datetime

import pytest

from api.pool import queue_next_songs


@pytest.mark.asyncio
async def should_send_update_when_scheduled_queue_job_updates_playback(test_client, existing_playback,
                                                                       fixed_track_length_ms,
                                                                       monkeypatch, playback_service,
                                                                       valid_token_header):
    delta_to_soon = datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000))
    soon = datetime.datetime.now() + delta_to_soon
    soon_utc = datetime.datetime.now(datetime.timezone.utc) + delta_to_soon

    class MockDateTime:
        @classmethod
        def now(cls, tz_info=None):
            return soon if tz_info is None else soon_utc

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    with test_client.websocket_connect("/pool/playback/register_listener", headers=valid_token_header) as websocket:
        await queue_next_songs(playback_service)
        data = websocket.receive_json()
        assert data["name"] in [track["name"] for track in existing_playback]
        assert data["spotify_icon_uri"] in [track["album"]["images"][0]["url"] for track in existing_playback]
        assert data["spotify_track_uri"] in [track["uri"] for track in existing_playback]
        assert data["duration_ms"] == fixed_track_length_ms


def should_send_update_when_other_user_in_pool_skips(test_client, existing_playback, another_logged_in_user_header,
                                                     valid_token_header, shared_pool_code, validate_response):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    with test_client.websocket_connect("/pool/playback/register_listener",
                                       headers=another_logged_in_user_header) as websocket:
        response = test_client.post("/pool/playback/skip", headers=valid_token_header)
        result = validate_response(response)
        data = websocket.receive_json()
        assert data == result
