from unittest.mock import Mock

import httpx
import pytest
from _pytest.fixtures import FixtureRequest
from starlette.testclient import TestClient

from helpers.classes import ErrorData
from test_types.callables import CreateSearchResponse, ValidatePaginatedResultLength, ValidateResponse, \
    BuildSuccessResponse, AssertTokenInHeaders, RunSearchCall
from test_types.typed_dictionaries import Headers
from test_types.aliases import MockResponseQueue


@pytest.fixture(params=["album", "artist", "track", "playlist"])
def search_item_type(request) -> str:
    return request.param


@pytest.fixture()
def run_search_resource_call(request: FixtureRequest, test_client: TestClient, valid_token_header: Headers,
                             requests_client_get_queue: MockResponseQueue, search_item_type,
                             run_search_call: RunSearchCall) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        item_query_part: str = f"{search_item_type}s"
        mocker_name = f"create_{search_item_type}_paginated_search"
        mocker_callable: CreateSearchResponse = request.getfixturevalue(mocker_name)
        return run_search_call(item_query_part, mocker_callable, query, limit)

    return wrapper


def should_propagate_errors_from_spotify_api(test_client: TestClient, valid_token_header: Headers,
                                             validate_response: ValidateResponse, search_item_type: str,
                                             spotify_error_message: ErrorData):
    response = test_client.get(f"/search/{search_item_type}s?query=test", headers=valid_token_header)
    json_data = validate_response(response, 502)
    assert json_data["detail"] == (f"Error code {spotify_error_message.code} received while calling Spotify API. "
                                   f"Message: {spotify_error_message.message}")


def should_include_current_token_in_response_headers(requests_client_get_queue: MockResponseQueue,
                                                     build_success_response: BuildSuccessResponse, test_client,
                                                     valid_token_header: Headers,
                                                     assert_token_in_headers: AssertTokenInHeaders,
                                                     run_search_resource_call):
    query = "test query"
    result = run_search_resource_call(query)
    assert_token_in_headers(result)


def should_return_bad_request_without_calling_spotify_on_empty_query(test_client: TestClient,
                                                                     valid_token_header: Headers,
                                                                     validate_response: ValidateResponse,
                                                                     search_item_type: str,
                                                                     requests_client: Mock):
    query = ""
    result = test_client.get(f"/search/{search_item_type}s?query={query}", headers=valid_token_header)

    json_data = validate_response(result, 400)
    assert json_data["detail"] == "Cannot perform a search with an empty string"
    requests_client.get.assert_not_called()


def should_get_twenty_items_by_default(validate_response: ValidateResponse,
                                       validate_paginated_result_length: ValidatePaginatedResultLength,
                                       run_search_resource_call: CreateSearchResponse):
    query = "my query"
    result = run_search_resource_call(query)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result)


def should_query_spotify_for_items_with_provided_query_string(run_search_resource_call: CreateSearchResponse,
                                                              test_client: TestClient, valid_token_header: Headers,
                                                              requests_client: Mock, search_item_type: str
                                                              ):
    query = "my query"
    run_search_resource_call(query)
    full_query = f"https://api.spotify.com/v1/search?q={query}&type={search_item_type}&offset=0&limit=20"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)


def should_return_less_results_if_twenty_not_found(test_client: TestClient, validate_response: ValidateResponse,
                                                   validate_paginated_result_length: ValidatePaginatedResultLength,
                                                   run_search_resource_call: CreateSearchResponse):
    expected_result_count = 7
    query = "my query"
    result = run_search_resource_call(query, expected_result_count)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result, expected_result_count)


def should_use_offset_and_limit_if_provided(test_client: TestClient, valid_token_header: Headers, requests_client: Mock,
                                            create_album_paginated_search: CreateSearchResponse,
                                            validate_response: ValidateResponse, search_item_type: str,
                                            validate_paginated_result_length: ValidatePaginatedResultLength,
                                            run_search_resource_call: CreateSearchResponse):
    offset = 20
    limit = 10
    query = "my query"
    result = run_search_resource_call(f"{query}&offset={offset}&limit={limit}", limit)
    full_query = f"https://api.spotify.com/v1/search?q={query}&type={search_item_type}&offset={offset}&limit={limit}"
    requests_client.get.assert_called_with(full_query, headers=valid_token_header)
    search_result = validate_response(result)
    validate_paginated_result_length(search_result, limit)