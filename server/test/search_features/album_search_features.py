from unittest.mock import Mock

import httpx
import pytest
from starlette.testclient import TestClient

from test_types.callables import MockAlbumSearchResult, CreatePaginatedSearchResult, MockArtistSearchResult, \
    BuildSuccessResponse, ValidateResponse, ValidatePaginatedResultLength, CreateSearchResponse
from test_types.typed_dictionaries import Headers
from test_types.aliases import MockResponseQueue


@pytest.fixture
def create_album_paginated_search(create_mock_album_search_result: MockAlbumSearchResult,
                                  create_paginated_search_result: CreatePaginatedSearchResult,
                                  create_mock_artist_search_result: MockArtistSearchResult,
                                  build_success_response: BuildSuccessResponse) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        artists = [create_mock_artist_search_result() for _ in range(limit)]
        albums = [create_mock_album_search_result(artist) for artist in artists]
        return_json = {
            "albums": create_paginated_search_result(query, limit, albums)
        }
        return build_success_response(return_json)

    return wrapper


def should_get_twenty_albums_by_default(test_client: TestClient, requests_client_get_queue: MockResponseQueue,
                                        validate_response: ValidateResponse, valid_token_header: Headers,
                                        validate_paginated_result_length: ValidatePaginatedResultLength,
                                        create_album_paginated_search: CreateSearchResponse):
    query = "my query"
    requests_client_get_queue.append(create_album_paginated_search(query))
    result = test_client.get(f"/search/albums?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result)


def should_query_spotify_for_albums_with_provided_query_string(
        test_client: TestClient, valid_token_header: Headers, requests_client: Mock,
        create_album_paginated_search: CreateSearchResponse, requests_client_get_queue: MockResponseQueue):
    query = "my query"
    requests_client_get_queue.append(create_album_paginated_search(query))
    test_client.get(f"/search/albums?query={query}", headers=valid_token_header)
    full_query = f"https://api.spotify.com/v1/search?q={query}&type=album&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)


def should_return_less_results_if_twenty_not_found(test_client: TestClient, valid_token_header: Headers,
                                                   validate_response: ValidateResponse, requests_client: Mock,
                                                   validate_paginated_result_length: ValidatePaginatedResultLength,
                                                   create_album_paginated_search: CreateSearchResponse,
                                                   requests_client_get_queue: MockResponseQueue):
    expected_result_count = 7
    query = "my query"
    requests_client_get_queue.append(create_album_paginated_search(query, expected_result_count))
    result = test_client.get(f"/search/albums?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result, expected_result_count)


def should_use_offset_and_limit_if_provided(test_client: TestClient, valid_token_header: Headers, requests_client: Mock,
                                            create_album_paginated_search: CreateSearchResponse,
                                            validate_response: ValidateResponse,
                                            requests_client_get_queue: MockResponseQueue,
                                            validate_paginated_result_length: ValidatePaginatedResultLength):
    offset = 20
    limit = 10
    query = "my query"
    requests_client_get_queue.append(create_album_paginated_search(query, limit))
    result = test_client.get(f"/search/albums?query={query}&offset={offset}&limit={limit}", headers=valid_token_header)
    full_query = f"https://api.spotify.com/v1/search?q={query}&type=album&offset={offset}&limit={limit}"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result, limit)
