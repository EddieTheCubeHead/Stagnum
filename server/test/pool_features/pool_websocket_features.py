import random
from unittest.mock import Mock

from api.pool.models import PoolContent


def should_get_update_when_pool_contents_added(test_client, valid_token_header, shared_pool_code,
                                               another_logged_in_user_header, build_success_response,
                                               create_mock_playlist_fetch_result, requests_client, logged_in_user_id):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    with test_client.websocket_connect("/pool/register_listener", headers=another_logged_in_user_header) as websocket:
        playlist = create_mock_playlist_fetch_result(15)
        requests_client.get = Mock(return_value=build_success_response(playlist))
        pool_content_data = PoolContent(spotify_uri=playlist["uri"]).model_dump()
        test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)
        data = websocket.receive_json()
        for user_data in data["users"]:
            if user_data["user"]["spotify_id"] == logged_in_user_id:
                assert len(user_data["collections"]) == 1


def should_get_update_when_pool_contents_deleted(test_client, valid_token_header, shared_pool_code,
                                                 another_logged_in_user_header, logged_in_user_id, existing_playback):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    with test_client.websocket_connect("/pool/register_listener", headers=another_logged_in_user_header) as websocket:
        deleted_song = random.choice(existing_playback)
        test_client.delete(f"/pool/content/{deleted_song["uri"]}", headers=valid_token_header)
        data = websocket.receive_json()
        for user_data in data["users"]:
            if user_data["user"]["spotify_id"] == logged_in_user_id:
                assert len(user_data["tracks"]) == len(existing_playback) - 1


def should_get_update_when_user_joins_pool(test_client, valid_token_header, shared_pool_code,
                                           another_logged_in_user_header, logged_in_user_id, existing_playback):
    with test_client.websocket_connect("/pool/register_listener", headers=valid_token_header) as websocket:
        test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
        data = websocket.receive_json()
        assert len(data["users"]) == 2
