from unittest.mock import Mock

import httpx
import pytest
from starlette.testclient import TestClient

from conftest import ErrorData
from test_types.callables import CreateGeneralSearch, MockAlbumSearchResult, MockPlaylistSearchResult, \
    MockArtistSearchResult, MockTrackSearchResult, CreatePaginatedSearchResult, CreateSearchResponse, \
    BuildSuccessResponse, ValidateResponse, ValidatePaginatedResultLength, AssertTokenInHeaders
from test_types.typed_dictionaries import Headers
from test_types.aliases import MockResponseQueue


@pytest.fixture
def build_spotify_general_search(create_mock_album_search_result: MockAlbumSearchResult,
                                 create_mock_playlist_search_result: MockPlaylistSearchResult,
                                 create_mock_artist_search_result: MockArtistSearchResult,
                                 create_mock_track_search_result: MockTrackSearchResult,
                                 create_paginated_search_result: CreatePaginatedSearchResult) -> CreateGeneralSearch:
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
def build_spotify_general_search_response(build_spotify_general_search: CreateGeneralSearch,
                                          build_success_response: BuildSuccessResponse) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        return build_success_response(build_spotify_general_search(query, limit))

    return wrapper


@pytest.fixture(params=[None, "albums", "artists", "tracks", "playlists"])
def search_resource_url(request) -> str:
    return f"/{request.param}" if request.param is not None else ""


def should_return_twenty_items_from_search(test_client: TestClient, valid_token_header: Headers,
                                           build_spotify_general_search_response: CreateSearchResponse,
                                           validate_response: ValidateResponse, requests_client: Mock,
                                           validate_paginated_result_length: ValidatePaginatedResultLength):
    query = "my query"
    requests_client.get = Mock(return_value=build_spotify_general_search_response(query))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type])


def should_return_less_than_twenty_results_if_spotify_returns_less(
        test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse,
        build_spotify_general_search_response: CreateSearchResponse, requests_client: Mock,
        validate_paginated_result_length: ValidatePaginatedResultLength):
    query = "my query"
    limit = 5
    requests_client.get = Mock(return_value=build_spotify_general_search_response(query, limit))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type], limit)


def should_call_spotify_with_the_provided_query(test_client: TestClient, valid_token_header: Headers,
                                                build_spotify_general_search_response: CreateSearchResponse,
                                                requests_client: Mock):
    query = "test query please ignore"
    requests_client.get = Mock(return_value=build_spotify_general_search_response(query))
    test_client.get(f"/search?query={query}", headers=valid_token_header)
    types = ",".join(["track", "album", "artist", "playlist"])
    full_query = f"https://api.spotify.com/v1/search?q={query}&type={types}&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)


def should_return_largest_image(test_client: TestClient, valid_token_header: Headers, requests_client: Mock,
                                build_spotify_general_search: CreateGeneralSearch, validate_response: ValidateResponse,
                                build_success_response: BuildSuccessResponse):
    query = "test query"
    search_result = build_spotify_general_search(query)
    search_result["albums"]["items"][0]["images"].append(
        {"url": "my_expected_image_url", "height": 500, "width": 600})
    requests_client.get = Mock(return_value=build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["results"][0]["icon_link"] == "my_expected_image_url"


def should_treat_none_size_as_zero(test_client: TestClient, valid_token_header: Headers, requests_client: Mock,
                                   build_spotify_general_search: CreateGeneralSearch,
                                   validate_response: ValidateResponse, build_success_response: BuildSuccessResponse):
    query = "test query"
    search_result = build_spotify_general_search(query)
    images = search_result["albums"]["items"][0]["images"]
    expected_url = images[0]["url"]
    images.append({"url": "my_invalid_image_url", "height": None, "width": None})
    requests_client.get = Mock(return_value=build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["results"][0]["icon_link"] == expected_url


def should_return_none_size_if_only_image(test_client: TestClient, valid_token_header: Headers, requests_client: Mock,
                                          build_spotify_general_search: CreateGeneralSearch,
                                          validate_response: ValidateResponse,
                                          build_success_response: BuildSuccessResponse):
    query = "test query"
    search_result = build_spotify_general_search(query)
    images = search_result["albums"]["items"][0]["images"]
    images.clear()
    images.append({"url": "my_expected_image_url", "height": None, "width": None})
    requests_client.get = Mock(return_value=build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["results"][0]["icon_link"] == "my_expected_image_url"


@pytest.mark.parametrize("date_string", ["2021-01-10", "2021-01", "2021"])
def should_accept_any_date_starting_with_year(test_client: TestClient, valid_token_header: Headers,
                                              build_spotify_general_search: CreateGeneralSearch,
                                              validate_response: ValidateResponse, requests_client: Mock,
                                              build_success_response: BuildSuccessResponse, date_string: str):
    query = "test query"
    search_result = build_spotify_general_search(query)
    search_result["albums"]["items"][0]["release_date"] = date_string
    requests_client.get = Mock(return_value=build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["results"][0]["year"] == 2021


def should_propagate_errors_from_spotify_api(test_client: TestClient, valid_token_header: Headers,
                                             validate_response: ValidateResponse, search_resource_url: str,
                                             spotify_error_message: ErrorData):
    response = test_client.get(f"/search{search_resource_url}?query=test", headers=valid_token_header)
    json_data = validate_response(response, 502)
    assert json_data["detail"] == (f"Error code {spotify_error_message.code} received while calling Spotify API. "
                                   f"Message: {spotify_error_message.message}")


def should_include_current_token_in_response_headers(requests_client_get_queue: MockResponseQueue,
                                                     build_success_response: BuildSuccessResponse, test_client,
                                                     search_resource_url: str, valid_token_header: Headers,
                                                     assert_token_in_headers: AssertTokenInHeaders,
                                                     build_spotify_general_search: CreateGeneralSearch):
    query = "test query"
    search_result = build_spotify_general_search(query)
    requests_client_get_queue.append(build_success_response(search_result))
    result = test_client.get(f"/search{search_resource_url}?query={query}", headers=valid_token_header)
    assert_token_in_headers(result)


def should_return_bad_request_without_calling_spotify_on_empty_query(test_client: TestClient,
                                                                     valid_token_header: Headers,
                                                                     validate_response: ValidateResponse,
                                                                     search_resource_url: str,
                                                                     requests_client: Mock):
    query = ""
    result = test_client.get(f"/search{search_resource_url}?query={query}", headers=valid_token_header)

    json_data = validate_response(result, 400)
    assert json_data["detail"] == "Cannot perform a search with an empty string"
    requests_client.get.assert_not_called()
