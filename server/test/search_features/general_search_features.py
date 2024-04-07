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
        return {
            "tracks": create_paginated_search_result(query, limit, tracks),
            "artists": create_paginated_search_result(query, limit, artists),
            "albums": create_paginated_search_result(query, limit, albums),
            "playlists": create_paginated_search_result(query, limit, playlists)
        }

    return wrapper


@pytest.fixture
def build_spotify_general_search_response(mock_spotify_general_search, build_success_response):
    def wrapper(query: str, limit: int = 20):
        return build_success_response(mock_spotify_general_search(query, limit))

    return wrapper


def should_return_twenty_items_from_search(test_client, valid_token_header, build_spotify_general_search_response,
                                           validate_response, requests_client, validate_paginated_result_length):
    query = "my query"
    requests_client.get = Mock(return_value=build_spotify_general_search_response(query))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type])


def should_return_less_than_twenty_results_if_spotify_returns_less(test_client, valid_token_header,
                                                                   build_spotify_general_search_response, validate_response,
                                                                   requests_client, validate_paginated_result_length):
    query = "my query"
    limit = 5
    requests_client.get = Mock(return_value=build_spotify_general_search_response(query, limit))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type], limit)


def should_call_spotify_with_the_provided_query(test_client, valid_token_header, build_spotify_general_search_response,
                                                requests_client):
    query = "test query please ignore"
    requests_client.get = Mock(return_value=build_spotify_general_search_response(query))
    test_client.get(f"/search?query={query}", headers=valid_token_header)
    types = ",".join(["track", "album", "artist", "playlist"])
    full_query = f"https://api.spotify.com/v1/search?q={query}&type={types}&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)


def should_return_largest_image(test_client, valid_token_header, mock_spotify_general_search, validate_response,
                                requests_client, build_success_response):
    query = "test query"
    search_result = mock_spotify_general_search(query)
    search_result["albums"]["items"][0]["images"].append(
        {"url": "my_expected_image_url", "height": 500, "width": 600})
    requests_client.get = Mock(return_value=build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["results"][0]["icon_link"] == "my_expected_image_url"


def should_treat_none_size_as_zero(test_client, valid_token_header, mock_spotify_general_search, validate_response,
                                   requests_client, build_success_response):
    query = "test query"
    search_result = mock_spotify_general_search(query)
    images = search_result["albums"]["items"][0]["images"]
    expected_url = images[0]["url"]
    images.append({"url": "my_invalid_image_url", "height": None, "width": None})
    requests_client.get = Mock(return_value=build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["results"][0]["icon_link"] == expected_url


def should_return_none_size_if_only_image(test_client, valid_token_header, mock_spotify_general_search, validate_response,
                                          requests_client, build_success_response):
    query = "test query"
    search_result = mock_spotify_general_search(query)
    images = search_result["albums"]["items"][0]["images"]
    images.clear()
    images.append({"url": "my_expected_image_url", "height": None, "width": None})
    requests_client.get = Mock(return_value=build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["results"][0]["icon_link"] == "my_expected_image_url"


@pytest.mark.parametrize("date_string", ["2021-01-10", "2021-01", "2021"])
def should_accept_any_date_starting_with_year(test_client, valid_token_header, mock_spotify_general_search,
                                              validate_response, requests_client, build_success_response, date_string):
    query = "test query"
    search_result = mock_spotify_general_search(query)
    search_result["albums"]["items"][0]["release_date"] = date_string
    requests_client.get = Mock(return_value=build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["results"][0]["year"] == 2021
