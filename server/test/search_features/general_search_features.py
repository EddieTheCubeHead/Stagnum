from unittest.mock import Mock

import httpx
import pytest
from starlette.testclient import TestClient

from conftest import ErrorData
from test_types.aliases import MockResponseQueue
from test_types.callables import CreateGeneralSearch, CreateSearchResponse, \
    BuildSuccessResponse, ValidateResponse, ValidatePaginatedResultLength, AssertTokenInHeaders, RunSearchCall
from test_types.typed_dictionaries import Headers


@pytest.fixture
def run_general_search(run_search_call: RunSearchCall,
                       build_spotify_general_search_response: CreateSearchResponse) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        return run_search_call(None, build_spotify_general_search_response, query, limit)

    return wrapper


def should_return_twenty_items_from_search(test_client: TestClient, valid_token_header: Headers,
                                           build_spotify_general_search_response: CreateSearchResponse,
                                           validate_response: ValidateResponse, requests_client: Mock,
                                           validate_paginated_result_length: ValidatePaginatedResultLength,
                                           run_general_search: CreateSearchResponse):
    result = run_general_search("my query")
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type])


def should_return_less_than_twenty_results_if_spotify_returns_less(
        validate_response: ValidateResponse, validate_paginated_result_length: ValidatePaginatedResultLength,
        run_general_search: CreateSearchResponse):
    limit = 5
    result = run_general_search("my query", limit)
    search_result = validate_response(result)
    for item_type in ("tracks", "albums", "artists", "playlists"):
        validate_paginated_result_length(search_result[item_type], limit)


def should_call_spotify_with_the_provided_query(valid_token_header: Headers, requests_client: Mock,
                                                run_general_search: CreateSearchResponse):
    query = "test query please ignore"
    run_general_search(query)
    types = ",".join(["track", "album", "artist", "playlist"])
    full_query = f"https://api.spotify.com/v1/search?q={query}&type={types}&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)


def should_return_largest_image(test_client: TestClient, valid_token_header: Headers,
                                requests_client_get_queue: MockResponseQueue,
                                build_spotify_general_search: CreateGeneralSearch, validate_response: ValidateResponse,
                                build_success_response: BuildSuccessResponse):
    query = "test query"
    search_result = build_spotify_general_search(query)
    search_result["albums"]["items"][0]["images"].append(
        {"url": "my_expected_image_url", "height": 500, "width": 600})
    requests_client_get_queue.append(build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["items"][0]["icon_link"] == "my_expected_image_url"


def should_treat_none_size_as_zero(test_client: TestClient, valid_token_header: Headers,
                                   requests_client_get_queue: MockResponseQueue,
                                   build_spotify_general_search: CreateGeneralSearch,
                                   validate_response: ValidateResponse, build_success_response: BuildSuccessResponse):
    query = "test query"
    search_result = build_spotify_general_search(query)
    images = search_result["albums"]["items"][0]["images"]
    expected_url = images[0]["url"]
    images.append({"url": "my_invalid_image_url", "height": None, "width": None})
    requests_client_get_queue.append(build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
    search_result = validate_response(result)
    assert search_result["albums"]["items"][0]["icon_link"] == expected_url


def should_return_none_size_if_only_image(test_client: TestClient, valid_token_header: Headers,
                                          requests_client_get_queue: Mock,
                                          build_spotify_general_search: CreateGeneralSearch,
                                          validate_response: ValidateResponse,
                                          build_success_response: BuildSuccessResponse):
    query = "test query"
    expected_image_url = "my_expected_image_url"
    search_result = build_spotify_general_search(query)
    images = search_result["albums"]["items"][0]["images"]
    images.clear()
    images.append({"url": ("%s" % expected_image_url), "height": None, "width": None})
    requests_client_get_queue.append(build_success_response(search_result))
    result = test_client.get(f"/search?query={query}", headers=valid_token_header)
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
    response = test_client.get(f"/search?query=test", headers=valid_token_header)
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
