from unittest.mock import Mock

import httpx
import pytest
from starlette.testclient import TestClient

from conftest import ErrorData
from test_types.aliases import MockResponseQueue
from test_types.callables import CreateGeneralSearch, CreateSearchResponse, \
    BuildSuccessResponse, ValidateResponse, ValidatePaginatedResultLength, AssertTokenInHeaders, RunSearchCall, \
    CreateSearchResponseFromImages, RunGeneralSearchWithCustomImages, RunSearch
from test_types.typed_dictionaries import Headers, ImageData


@pytest.fixture
def run_general_search(run_search_call: RunSearchCall,
                       build_spotify_general_search_response: CreateSearchResponse) -> RunSearch:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        return run_search_call(None, build_spotify_general_search_response, query, limit)

    return wrapper


@pytest.fixture
def build_general_search_with_custom_images(build_spotify_general_search: CreateGeneralSearch,
                                            build_success_response: BuildSuccessResponse) \
        -> CreateSearchResponseFromImages:
    def wrapper(query: str, limit: int = 20, images: list[ImageData] | None = None) -> httpx.Response:
        response = build_spotify_general_search(query, limit)
        if images is not None:
            response["albums"]["items"][0]["images"] = images

        return build_success_response(response)

    return wrapper


@pytest.fixture
def run_general_search_with_custom_images(build_general_search_with_custom_images: CreateSearchResponseFromImages,
                                          requests_client_get_queue: MockResponseQueue, test_client: TestClient,
                                          valid_token_header: Headers) -> RunGeneralSearchWithCustomImages:
    def wrapper(query: str, limit: int = 20, images: list[ImageData] = None) -> httpx.Response:
        requests_client_get_queue.append(build_general_search_with_custom_images(query, limit, images))
        return test_client.get(f"/search?query={query}", headers=valid_token_header)

    return wrapper


@pytest.fixture
def default_image_data() -> list[ImageData]:
    return [
        {
            "url": "https://pic.spotify.url/image_test_normal_size",
            "height": 300,
            "width": 300
        }
    ]


def should_return_twenty_items_from_search(test_client: TestClient, valid_token_header: Headers,
                                           build_spotify_general_search_response: CreateSearchResponse,
                                           validate_response: ValidateResponse, requests_client: Mock,
                                           validate_paginated_result_length: ValidatePaginatedResultLength,
                                           run_general_search: RunSearch):
    result = run_general_search("my query")
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type])


def should_return_less_than_twenty_results_if_spotify_returns_less(
        validate_response: ValidateResponse, validate_paginated_result_length: ValidatePaginatedResultLength,
        run_general_search: RunSearch):
    limit = 5
    result = run_general_search("my query", limit)
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type], limit)


def should_call_spotify_with_the_provided_query(valid_token_header: Headers, requests_client: Mock,
                                                run_general_search: RunSearch):
    query = "test query please ignore"
    run_general_search(query)
    types = ",".join(["track", "album", "artist", "playlist"])
    full_query = f"https://api.spotify.com/v1/search?q={query}&type={types}&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)


def should_return_largest_image(validate_response: ValidateResponse, default_image_data: list[ImageData],
                                run_general_search_with_custom_images: RunGeneralSearchWithCustomImages):
    default_image_data.append({"url": "my_expected_image_url", "height": 500, "width": 600})
    result = run_general_search_with_custom_images("query", images=default_image_data)
    search_result = validate_response(result)
    assert search_result["albums"]["items"][0]["icon_link"] == "my_expected_image_url"


def should_treat_none_size_as_zero(default_image_data: list[ImageData], validate_response: ValidateResponse,
                                   run_general_search_with_custom_images: RunGeneralSearchWithCustomImages):
    default_image_data.append({"url": "my_expected_image_url", "height": None, "width": None})
    result = run_general_search_with_custom_images("query", images=default_image_data)
    search_result = validate_response(result)
    assert search_result["albums"]["items"][0]["icon_link"] == default_image_data[0]["url"]


def should_return_none_size_if_only_image(run_general_search_with_custom_images: RunGeneralSearchWithCustomImages,
                                          validate_response: ValidateResponse):
    expected_image_url = "my_expected_image_url"
    images: list[ImageData] = [{"url": expected_image_url, "height": None, "width": None}]
    result = run_general_search_with_custom_images("query", images=images)
    search_result = validate_response(result)
    assert search_result["albums"]["items"][0]["icon_link"] == expected_image_url


@pytest.mark.parametrize("date_string", ["2021-01-10", "2021-01", "2021"])
def should_accept_any_date_starting_with_year(test_client: TestClient, valid_token_header: Headers,
                                              build_spotify_general_search: CreateGeneralSearch,
                                              validate_response: ValidateResponse,
                                              requests_client_get_queue: MockResponseQueue,
                                              build_success_response: BuildSuccessResponse, date_string: str):
    query = "test query"
    search_result = build_spotify_general_search(query)
    search_result["albums"]["items"][0]["release_date"] = date_string
    requests_client_get_queue.append(build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["items"][0]["year"] == 2021


def should_propagate_errors_from_spotify_api(test_client: TestClient, valid_token_header: Headers,
                                             validate_response: ValidateResponse,
                                             spotify_error_message: ErrorData):
    response = test_client.get("/search?query=test", headers=valid_token_header)
    json_data = validate_response(response, 502)
    assert json_data["detail"] == (f"Error code {spotify_error_message.code} received while calling Spotify API. "
                                   f"Message: {spotify_error_message.message}")


def should_include_current_token_in_response_headers(requests_client_get_queue: MockResponseQueue,
                                                     build_success_response: BuildSuccessResponse, test_client,
                                                     valid_token_header: Headers,
                                                     assert_token_in_headers: AssertTokenInHeaders,
                                                     run_general_search):
    query = "test query"
    result = run_general_search(query)
    assert_token_in_headers(result)


def should_return_bad_request_without_calling_spotify_on_empty_query(test_client: TestClient,
                                                                     valid_token_header: Headers,
                                                                     validate_response: ValidateResponse,
                                                                     requests_client: Mock):
    query = ""
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)

    json_data = validate_response(result, 400)
    assert json_data["detail"] == "Cannot perform a search with an empty string"
    requests_client.get.assert_not_called()
