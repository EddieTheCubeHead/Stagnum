import datetime

import pytest

from api.pool import queue_next_songs


@pytest.mark.wip
def should_send_update_when_scheduled_queue_job_updates_playback(test_client, existing_playback, fixed_track_length_ms,
                                                                 monkeypatch, playback_service):
    delta_to_soon = datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000))
    soon = datetime.datetime.now() + delta_to_soon
    soon_utc = datetime.datetime.now(datetime.timezone.utc) + delta_to_soon

    class MockDateTime:
        @classmethod
        def now(cls, tz_info=None):
            return soon if tz_info is None else soon_utc

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    with test_client.websocket_connect("/pool/playback/register_listener") as websocket:
        queue_next_songs(playback_service)
        data = websocket.receive_json()
        assert data is not None
