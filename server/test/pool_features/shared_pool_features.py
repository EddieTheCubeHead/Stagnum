from unittest.mock import Mock

import pytest
from helpers.classes import MockedPoolContents
from starlette.testclient import TestClient
from test_types.callables import (
    AssertTokenInHeaders,
    CreatePool,
    GetQueryParameter,
    MockPlaylistFetch,
    MockPoolContentFetches,
    SkipSong,
    ValidateErrorResponse,
    ValidateModel,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers

from api.pool.models import PoolFullContents
from database.entities import PoolMember, User


@pytest.mark.usefixtures("existing_playback")
def should_return_pool_code_from_share_route(
    test_client: TestClient, validate_model: ValidateModel, valid_token_header: Headers
) -> None:
    response = test_client.post("/pool/share", headers=valid_token_header)

    model = validate_model(PoolFullContents, response)
    assert model.share_code is not None


def should_return_not_found_from_share_route_if_user_has_no_pool(
    test_client: TestClient, logged_in_user: User, valid_token_header: Headers, validate_response: ValidateResponse
) -> None:
    response = test_client.post("/pool/share", headers=valid_token_header)

    json_data = validate_response(response, 404)
    assert json_data["detail"] == f"Could not find pool for user {logged_in_user.spotify_username}"


@pytest.mark.usefixtures("existing_playback")
def should_have_only_uppercase_letters_and_digits_in_share_code(
    test_client: TestClient, validate_response: ValidateResponse, valid_token_header: Headers
) -> None:
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    for char in result["share_code"]:
        assert char.isupper() or char.isdigit()


@pytest.mark.usefixtures("existing_playback")
def should_have_eight_characters_in_share_code(
    test_client: TestClient, validate_response: ValidateResponse, valid_token_header: Headers
) -> None:
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert len(result["share_code"]) == 8


def should_be_able_to_join_shared_pool_with_code(
    shared_pool_code: str,
    test_client: TestClient,
    another_logged_in_user_header: Headers,
    validate_response: ValidateResponse,
) -> None:
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    assert len(result["users"]) == 2
    assert result["share_code"] == shared_pool_code


def should_see_pool_existing_songs_when_joining_shared_pool(
    shared_pool_code: str,
    test_client: TestClient,
    another_logged_in_user_header: Headers,
    validate_response: ValidateResponse,
    logged_in_user_id: str,
    existing_pool: list[PoolMember],
) -> None:
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    for user_content in result["users"]:
        if user_content["user"]["spotify_id"] == logged_in_user_id:
            assert len(user_content["tracks"]) == len(existing_pool)


def should_show_added_songs_to_pool_main_user(
    test_client: TestClient,
    joined_user_header: Headers,
    validate_response: ValidateResponse,
    logged_in_user_id: str,
    valid_token_header: Headers,
    mock_playlist_fetch: MockPlaylistFetch,
) -> None:
    pool_content_data = mock_playlist_fetch(35)
    test_client.post("/pool/content", json=pool_content_data, headers=joined_user_header)

    response = test_client.get("/pool", headers=valid_token_header)

    result = validate_response(response)
    for user_content in result["users"]:
        if user_content["user"]["spotify_id"] != logged_in_user_id:
            assert len(user_content["collections"][0]["tracks"]) == 35


@pytest.mark.slow
def should_use_all_users_pools_in_shared_pool_playback(
    test_client: TestClient,
    joined_user_header: Headers,
    valid_token_header: Headers,
    get_query_parameter: GetQueryParameter,
    existing_pool: list[PoolMember],
    requests_client: Mock,
    mocked_pool_contents: MockedPoolContents,
    skip_song: SkipSong,
    mock_playlist_fetch: MockPlaylistFetch,
) -> None:
    pool_content_data = mock_playlist_fetch(15)
    test_client.post("/pool/content", json=pool_content_data, headers=joined_user_header)

    original_user_played_uris = set()
    for _ in range(99):
        skip_song(valid_token_header)
        actual_queue_call = requests_client.post.call_args_list[-2]
        original_user_played_uris.add(get_query_parameter(actual_queue_call.args[0], "uri"))

    joined_user_played_uris = set()
    for _ in range(99):
        skip_song(joined_user_header)
        actual_queue_call = requests_client.post.call_args_list[-2]
        joined_user_played_uris.add(get_query_parameter(actual_queue_call.args[0], "uri"))

    original_user_track_uris = [track.content_uri for track in existing_pool]
    playlist = mocked_pool_contents.playlist.first_fetch
    joined_user_track_uris = [track["track"]["uri"] for track in playlist["tracks"]["items"]]

    original_played_original = False
    joined_played_original = False
    joined_played_joined = False
    original_played_joined = False
    for track_uri in original_user_track_uris:
        if track_uri in original_user_played_uris:
            original_played_original = True
        if track_uri in joined_user_played_uris:
            original_played_joined = True

    for track_uri in joined_user_track_uris:
        if track_uri in original_user_played_uris:
            joined_played_joined = True
        if track_uri in joined_user_played_uris:
            joined_played_original = True

    assert original_played_original
    assert joined_played_original
    assert joined_played_joined
    assert original_played_joined


@pytest.mark.usefixtures("existing_playback")
def should_not_get_pool_share_code_from_get_pool_before_initial_share(
    test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse
) -> None:
    response = test_client.get("/pool", headers=valid_token_header)

    result = validate_response(response)
    assert result["share_code"] is None


def should_get_pool_share_code_from_get_pool_after_initial_share(
    shared_pool_code: str,
    test_client: TestClient,
    valid_token_header: Headers,
    joined_user_header: Headers,
    validate_response: ValidateResponse,
) -> None:
    for header in (valid_token_header, joined_user_header):
        response = test_client.get("/pool", headers=header)
        result = validate_response(response)
        assert result["share_code"] == shared_pool_code


def should_return_error_response_when_attempting_to_join_own_pool(
    shared_pool_code: str,
    test_client: TestClient,
    valid_token_header: Headers,
    validate_error_response: ValidateErrorResponse,
) -> None:
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=valid_token_header)

    validate_error_response(response, 400, "Attempted to join own pool!")


def should_return_error_response_when_attempting_to_join_already_joined_pool(
    shared_pool_code: str,
    test_client: TestClient,
    joined_user_header: Headers,
    validate_error_response: ValidateErrorResponse,
) -> None:
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=joined_user_header)

    validate_error_response(response, 400, "Already a member of that pool!")


def should_return_error_response_when_attempting_to_join_pool_with_invalid_code(
    test_client: TestClient, valid_token_header: Headers, validate_error_response: ValidateErrorResponse
) -> None:
    invalid_code = "invalid_code_123"
    response = test_client.post(f"/pool/join/{invalid_code}", headers=valid_token_header)

    validate_error_response(response, 404, f'Could not find pool with code "{invalid_code}"')


@pytest.mark.usefixtures("shared_pool_code")
def should_return_error_response_when_attempting_to_share_own_pool_with_existing_share_code(
    test_client: TestClient, valid_token_header: Headers, validate_error_response: ValidateErrorResponse
) -> None:
    response = test_client.post("/pool/share", headers=valid_token_header)

    validate_error_response(response, 400, "Pool already shared!")


@pytest.mark.usefixtures("existing_playback")
def should_return_token_in_headers_for_share_route(
    test_client: TestClient, valid_token_header: Headers, assert_token_in_headers: AssertTokenInHeaders
) -> None:
    response = test_client.post("/pool/share", headers=valid_token_header)
    assert_token_in_headers(response)


def should_return_token_in_headers_for_join_route(
    shared_pool_code: str,
    test_client: TestClient,
    another_logged_in_user_header: Headers,
    assert_token_in_headers: AssertTokenInHeaders,
) -> None:
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    assert_token_in_headers(response)


def should_return_owner_user_data_on_join(
    shared_pool_code: str,
    test_client: TestClient,
    create_pool: CreatePool,
    validate_response: ValidateResponse,
    another_logged_in_user_header: Headers,
    logged_in_user: User,
) -> None:
    create_pool(tracks=1)

    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    assert result["owner"]["spotify_id"] == logged_in_user.spotify_id


def should_be_able_to_join_another_pool_after_creating_one(
    another_logged_in_user_header: Headers,
    test_client: TestClient,
    validate_response: ValidateResponse,
    shared_pool_code: str,
    mock_pool_content_fetches: MockPoolContentFetches,
) -> None:
    data_json = mock_pool_content_fetches(tracks=1)

    test_client.post("/pool", json=data_json, headers=another_logged_in_user_header)

    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    pool_response = validate_response(response)
    assert len(pool_response["users"]) == 2


def should_be_able_to_create_another_pool_after_joining_one(
    test_client: TestClient,
    validate_response: ValidateResponse,
    mocked_pool_contents: MockedPoolContents,
    joined_user_header: Headers,
    mock_pool_content_fetches: MockPoolContentFetches,
) -> None:
    data_json = mock_pool_content_fetches(tracks=1)

    response = test_client.post("/pool", json=data_json, headers=joined_user_header)

    pool_response = validate_response(response)
    assert pool_response["users"][0]["tracks"][0]["name"] == mocked_pool_contents.track["name"]
