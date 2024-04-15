from unittest.mock import Mock

from api.pool.models import PoolContent


def should_get_all_existing_tracks(existing_pool, test_client, valid_token_header, validate_response):
    response = test_client.get("/pool", headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["users"][0]["tracks"]) == len(existing_pool)


def should_return_mix_of_tracks_and_collections_correctly(test_client, valid_token_header, validate_response,
                                                          create_mock_track_search_result, build_success_response,
                                                          requests_client_get_queue, create_mock_artist_search_result,
                                                          create_mock_album_search_result, existing_pool,
                                                          create_mock_playlist_fetch_result):
    artist = create_mock_artist_search_result()
    artist_tracks = {"tracks": [create_mock_track_search_result(artist) for _ in range(10)]}
    album = create_mock_album_search_result(artist, [create_mock_track_search_result(artist) for _ in range(12)])
    playlist = create_mock_playlist_fetch_result(23)
    responses = [build_success_response(artist), build_success_response(artist_tracks), build_success_response(album),
                 build_success_response(playlist)]
    requests_client_get_queue.extend(responses)
    test_client.post("/pool/content", json=PoolContent(spotify_uri=artist["uri"]).model_dump(),
                     headers=valid_token_header)
    test_client.post("/pool/content", json=PoolContent(spotify_uri=album["uri"]).model_dump(),
                     headers=valid_token_header)
    test_client.post("/pool/content", json=PoolContent(spotify_uri=playlist["uri"]).model_dump(),
                     headers=valid_token_header)

    response = test_client.get("/pool", headers=valid_token_header)

    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["tracks"]) == len(existing_pool)
    assert len(user_pool["collections"]) == 3


def should_include_token_in_headers(existing_pool, test_client, valid_token_header, assert_token_in_headers):
    response = test_client.get("/pool", headers=valid_token_header)
    assert_token_in_headers(response)


def should_return_not_found_if_no_pool_for_user(test_client, valid_token_header, validate_response, logged_in_user):
    response = test_client.get("/pool", headers=valid_token_header)

    json_data = validate_response(response, 404)
    assert json_data["detail"] == f"Could not find pool for user {logged_in_user.spotify_username}"


def should_return_self_as_owner(existing_pool, test_client, valid_token_header, validate_response, logged_in_user):
    response = test_client.get("/pool", headers=valid_token_header)

    pool_response = validate_response(response)
    assert pool_response["owner"]["spotify_id"] == logged_in_user.spotify_id
