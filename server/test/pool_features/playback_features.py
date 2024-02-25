import datetime
from unittest.mock import Mock

import pytest
from sqlalchemy import select

from database.entities import PlaybackSession


def should_start_pool_playback_from_tracks_when_posting_new_pool_from_tracks(create_mock_track_search_result,
                                                                             requests_client, build_success_response,
                                                                             create_pool_creation_data_json,
                                                                             test_client, valid_token_header):
    tracks = [create_mock_track_search_result() for _ in range(15)]
    responses = [build_success_response(track) for track in tracks]
    requests_client.get = Mock(side_effect=responses)
    track_uris = [track["uri"] for track in tracks]
    data_json = create_pool_creation_data_json(*track_uris)

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.kwargs["json"]["position_ms"] == 0
    call_uri = actual_call.kwargs["json"]["uris"][0]
    assert call_uri in track_uris


def should_start_pool_playback_from_collection_tracks_when_posting_collection(create_mock_track_search_result,
                                                                              create_mock_playlist_search_result,
                                                                              requests_client, build_success_response,
                                                                              create_pool_creation_data_json,
                                                                              test_client, valid_token_header):
    tracks = [create_mock_track_search_result() for _ in range(25)]
    playlist = create_mock_playlist_search_result(tracks)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.kwargs["json"]["position_ms"] == 0
    call_uri = actual_call.kwargs["json"]["uris"][0]
    assert call_uri in [track["uri"] for track in tracks]


@pytest.mark.parametrize("repeat", range(15))
def should_not_start_pool_playback_from_collection_uri_when_posting_collection(create_mock_track_search_result,
                                                                               create_mock_playlist_search_result,
                                                                               requests_client, build_success_response,
                                                                               create_pool_creation_data_json,
                                                                               test_client, valid_token_header, repeat):
    # use only one track so test fails on repeats if main collection is ever used
    tracks = [create_mock_track_search_result() for _ in range(1)]
    playlist = create_mock_playlist_search_result(tracks)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    actual_call = requests_client.put.call_args
    assert actual_call.kwargs["json"]["position_ms"] == 0
    call_uri = actual_call.kwargs["json"]["uris"][0]
    assert call_uri == tracks[0]["uri"]


def should_save_next_track_change_time_on_playback_start(create_mock_track_search_result, requests_client,
                                                         build_success_response, create_pool_creation_data_json,
                                                         test_client, valid_token_header, db_connection,
                                                         logged_in_user_id):
    tracks = [create_mock_track_search_result() for _ in range(1)]
    responses = [build_success_response(track) for track in tracks]
    requests_client.get = Mock(side_effect=responses)
    track_uris = [track["uri"] for track in tracks]
    data_json = create_pool_creation_data_json(*track_uris)
    start_time = datetime.datetime.now()

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        playback_session = session.scalar(select(PlaybackSession).where(PlaybackSession.user_id == logged_in_user_id))
    expected_end_time = start_time + datetime.timedelta(milliseconds=tracks[0]["duration_ms"])
    assert playback_session.next_song_change_timestamp - expected_end_time < datetime.timedelta(milliseconds=100)
