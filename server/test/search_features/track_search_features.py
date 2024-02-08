from unittest.mock import Mock

import pytest


@pytest.fixture
def create_track_paginated_search(create_mock_track_search_result, create_paginated_search_result):
    def wrapper(query: str, limit: int = 20):
        tracks = [create_mock_track_search_result() for _ in range(limit)]
        return {
            "tracks": create_paginated_search_result(query, limit, tracks)
        }

    return wrapper


def should_get_twenty_tracks_by_default(test_client, valid_token_header, validate_response, requests_client,
                                        validate_paginated_result_length, create_track_paginated_search):
    query = "my query"
    requests_client.get = Mock(return_value=create_track_paginated_search(query))
    result = test_client.get(f"/search/tracks?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result)


def should_query_tracks_with_provided_query(test_client, valid_token_header, requests_client,
                                            create_track_paginated_search):
    query = "my query"
    requests_client.get = Mock(return_value=create_track_paginated_search(query))
    test_client.get(f"/search/tracks?query={query}", headers=valid_token_header)
    full_query = f"https://api.spotify.com/v1/search?q={query}&type=track&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers={"Authorization": valid_token_header["token"]})

