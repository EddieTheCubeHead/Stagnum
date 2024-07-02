from unittest.mock import Mock

import httpx
import pytest
from _pytest.fixtures import FixtureRequest
from helpers.classes import ErrorData
from starlette.testclient import TestClient
from test_types.callables import (
    AssertTokenInHeaders,
    CreateSearchResponse,
    RunSearch,
    RunSearchCall,
    ValidatePaginatedResultLength,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers


@pytest.fixture(params=["album", "artist", "track", "playlist"])
def search_item_type(request: FixtureRequest) -> str:
    return request.param


@pytest.fixture
def run_search_resource_call(
    request: FixtureRequest, search_item_type: str, run_search_call: RunSearchCall
) -> RunSearch:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        item_query_part: str = f"{search_item_type}s"
        mocker_name = f"create_{search_item_type}_paginated_search"
        mocker_callable: CreateSearchResponse = request.getfixturevalue(mocker_name)
        return run_search_call(item_query_part, mocker_callable, query, limit)

    return wrapper


def should_propagate_errors_from_spotify_api(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    search_item_type: str,
    spotify_error_message: ErrorData,
) -> None:
    response = test_client.get(f"/search/{search_item_type}s?query=test", headers=valid_token_header)
    json_data = validate_response(response, 502)
    assert json_data["detail"] == (
        f"Error code {spotify_error_message.code} received while calling Spotify API. "
        f"Message: {spotify_error_message.message}"
    )


def should_include_current_token_in_response_headers(
    assert_token_in_headers: AssertTokenInHeaders, run_search_resource_call: RunSearch
) -> None:
    query = "test query"
    result = run_search_resource_call(query)
    assert_token_in_headers(result)


def should_return_bad_request_without_calling_spotify_on_empty_query(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    search_item_type: str,
    requests_client: Mock,
) -> None:
    query = ""
    result = test_client.get(f"/search/{search_item_type}s?query={query}", headers=valid_token_header)

    json_data = validate_response(result, 400)
    assert json_data["detail"] == "Cannot perform a search with an empty string"
    requests_client.get.assert_not_called()


def should_get_twenty_items_by_default(
    validate_response: ValidateResponse,
    validate_paginated_result_length: ValidatePaginatedResultLength,
    run_search_resource_call: RunSearch,
) -> None:
    query = "my query"
    result = run_search_resource_call(query)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result)


def should_query_spotify_for_items_with_provided_query_string(
    run_search_resource_call: RunSearch, valid_token_header: Headers, requests_client: Mock, search_item_type: str
) -> None:
    query = "my query"
    run_search_resource_call(query)
    full_query = f"https://api.spotify.com/v1/search?q={query}&type={search_item_type}&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)


def should_return_spotify_resource_link_in_link_field(
    run_search_resource_call: RunSearch, validate_response: ValidateResponse
) -> None:
    result = run_search_resource_call("my query")
    response = validate_response(result)
    for item in response["items"]:
        # We always mock the href with "api" string and the external url with "url.spotify"
        assert "api" not in item["link"]
        assert "url.spotify" in item["link"]


def should_return_less_results_if_twenty_not_found(
    validate_response: ValidateResponse,
    validate_paginated_result_length: ValidatePaginatedResultLength,
    run_search_resource_call: RunSearch,
) -> None:
    expected_result_count = 7
    query = "my query"
    result = run_search_resource_call(query, expected_result_count)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result, expected_result_count)


def should_use_offset_and_limit_if_provided(
    valid_token_header: Headers,
    requests_client: Mock,
    validate_response: ValidateResponse,
    search_item_type: str,
    validate_paginated_result_length: ValidatePaginatedResultLength,
    run_search_resource_call: RunSearch,
) -> None:
    offset = 20
    limit = 10
    query = "my query"
    result = run_search_resource_call(f"{query}&offset={offset}&limit={limit}", limit)
    full_query = f"https://api.spotify.com/v1/search?q={query}&type={search_item_type}&offset={offset}&limit={limit}"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result, limit)
