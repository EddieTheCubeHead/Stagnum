import json
from unittest.mock import Mock

import pytest


@pytest.fixture
def mock_spotify_general_search(requests_client, create_mock_album_search_result, create_mock_playlist_search_result,
                                create_mock_artist_search_result, create_mock_track_search_result,
                                create_paginated_search_result):
    def wrapper(query: str, limit: int = 20):
        artists = [create_mock_artist_search_result() for _ in range(limit)]
        tracks = [create_mock_track_search_result() for _ in range(limit)]
        albums = [create_mock_album_search_result(artist) for artist in artists]
        playlists = [create_mock_playlist_search_result() for _ in range(limit)]
        return_json = {
            "tracks": create_paginated_search_result(query, limit, tracks),
            "artists": create_paginated_search_result(query, limit, artists),
            "albums": create_paginated_search_result(query, limit, albums),
            "playlists": create_paginated_search_result(query, limit, playlists)
        }
        response = Mock()
        response.status_code = 200
        response.content = json.dumps(return_json).encode("utf-8")
        return response

    return wrapper


def should_return_twenty_items_from_search(test_client, valid_token_header, mock_spotify_general_search,
                                           validate_response, requests_client, validate_paginated_result_length):
    query = "my query"
    requests_client.get = Mock(return_value=mock_spotify_general_search(query))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type])


def should_return_less_than_twenty_results_if_spotify_returns_less(test_client, valid_token_header,
                                                                   mock_spotify_general_search, validate_response,
                                                                   requests_client, validate_paginated_result_length):
    query = "my query"
    limit = 5
    requests_client.get = Mock(return_value=mock_spotify_general_search(query, limit))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type], limit)


def should_call_spotify_with_the_provided_query(test_client, valid_token_header, mock_spotify_general_search,
                                                requests_client):
    query = "test query please ignore"
    requests_client.get = Mock(return_value=mock_spotify_general_search(query))
    test_client.get(f"/search?query={query}", headers=valid_token_header)
    types = ",".join(["track", "album", "artist", "playlist"])
    full_query = f"https://api.spotify.com/v1/search?q={query}&type={types}&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers={"Authorization": valid_token_header["token"]})
