import json
from unittest.mock import Mock

import pytest


@pytest.fixture
def create_album_paginated_search(create_mock_album_search_result, create_paginated_search_result,
                                  create_mock_artist_search_result, build_success_response):
    def wrapper(query: str, limit: int = 20):
        artists = [create_mock_artist_search_result() for _ in range(limit)]
        albums = [create_mock_album_search_result(artist) for artist in artists]
        return_json = {
            "albums": create_paginated_search_result(query, limit, albums)
        }
        return build_success_response(return_json)

    return wrapper


def should_get_twenty_albums_by_default(test_client, valid_token_header, validate_response, requests_client,
                                        validate_paginated_result_length, create_album_paginated_search):
    query = "my query"
    requests_client.get = Mock(return_value=create_album_paginated_search(query))
    result = test_client.get(f"/search/albums?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result)


def should_query_spotify_for_albums_with_provided_query_string(test_client, valid_token_header, requests_client,
                                                               create_album_paginated_search):
    query = "my query"
    requests_client.get = Mock(return_value=create_album_paginated_search(query))
    test_client.get(f"/search/albums?query={query}", headers=valid_token_header)
    full_query = f"https://api.spotify.com/v1/search?q={query}&type=album&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers={"Authorization": valid_token_header["token"]})


def should_return_less_results_if_twenty_not_found(test_client, valid_token_header, validate_response, requests_client,
                                                   validate_paginated_result_length, create_album_paginated_search):
    expected_result_count = 7
    query = "my query"
    requests_client.get = Mock(return_value=create_album_paginated_search(query, expected_result_count))
    result = test_client.get(f"/search/albums?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result, expected_result_count)


def should_use_offset_and_limit_if_provided(test_client, valid_token_header, requests_client,
                                            create_album_paginated_search, validate_response,
                                            validate_paginated_result_length):
    offset = 20
    limit = 10
    query = "my query"
    requests_client.get = Mock(return_value=create_album_paginated_search(query, limit))
    result = test_client.get(f"/search/albums?query={query}&offset={offset}&limit={limit}", headers=valid_token_header)
    full_query = f"https://api.spotify.com/v1/search?q={query}&type=album&offset={offset}&limit={limit}"
    requests_client.get.assert_called_with(full_query, headers={"Authorization": valid_token_header["token"]})
    search_result = validate_response(result)
    validate_paginated_result_length(search_result, limit)