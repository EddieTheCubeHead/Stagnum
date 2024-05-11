import datetime
from typing import Any
from unittest.mock import Mock

import pytest
from sqlalchemy import select
from starlette.testclient import TestClient

from api.pool.models import PoolContent
from api.pool.randomization_algorithms import RandomizationParameters
from database.database_connection import ConnectionManager
from database.entities import PlaybackSession, Pool, User, PoolMember
from helpers.classes import MockedPoolContents
from test_types.aliases import MockResponseQueue
from test_types.callables import ValidateResponse, MockPlaylistFetchResult, \
    BuildSuccessResponse, GetQueryParameter, SkipSong, AssertTokenInHeaders, \
    IncrementNow, RunSchedulingJob, MockNoPlayerStateResponse, \
    MockTrackSearchResult, CreatePoolCreationDataJson, MockPlaylistFetch
from test_types.typed_dictionaries import Headers


def should_return_pool_code_from_share_route(existing_playback: list[dict[str, Any]], test_client: TestClient,
                                             validate_response: ValidateResponse,
                                             valid_token_header: Headers):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert result["share_code"] is not None
    assert type(result["share_code"]) == str


def should_return_not_found_from_share_route_if_user_has_no_pool(test_client: TestClient, logged_in_user: User,
                                                                 valid_token_header: Headers,
                                                                 validate_response: ValidateResponse):
    response = test_client.post("/pool/share", headers=valid_token_header)

    json_data = validate_response(response, 404)
    assert json_data["detail"] == f"Could not find pool for user {logged_in_user.spotify_username}"


def should_have_only_uppercase_letters_and_digits_in_share_code(existing_playback: list[dict[str, Any]],
                                                                test_client: TestClient,
                                                                validate_response: ValidateResponse,
                                                                valid_token_header: Headers):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    for char in result["share_code"]:
        assert char.isupper() or char.isdigit()


def should_have_eight_characters_in_share_code(existing_playback: list[dict[str, Any]], test_client: TestClient,
                                               validate_response: ValidateResponse,
                                               valid_token_header: Headers):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert len(result["share_code"]) == 8


def should_be_able_to_join_shared_pool_with_code(shared_pool_code: str, test_client: TestClient,
                                                 another_logged_in_user_header: Headers,
                                                 validate_response: ValidateResponse):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    assert len(result["users"]) == 2
    assert result["share_code"] == shared_pool_code


def should_see_pool_existing_songs_when_joining_shared_pool(shared_pool_code: str, test_client: TestClient,
                                                            another_logged_in_user_header: Headers,
                                                            validate_response: ValidateResponse,
                                                            logged_in_user_id: str, existing_pool: list[PoolMember]):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    for user_content in result["users"]:
        if user_content["user"]["spotify_id"] == logged_in_user_id:
            assert len(user_content["tracks"]) == len(existing_pool)


def should_show_added_songs_to_pool_main_user(shared_pool_code: str, test_client: TestClient,
                                              joined_user_header: Headers, requests_client: Mock,
                                              validate_response: ValidateResponse, logged_in_user_id: str,
                                              valid_token_header: Headers, existing_pool: list[PoolMember],
                                              create_mock_playlist_fetch_result: MockPlaylistFetchResult,
                                              build_success_response: BuildSuccessResponse):
    playlist = create_mock_playlist_fetch_result(35).first_fetch
    requests_client.get = Mock(return_value=build_success_response(playlist))
    pool_content_data = PoolContent(spotify_uri=playlist["uri"]).model_dump()
    test_client.post("/pool/content", json=pool_content_data, headers=joined_user_header)

    response = test_client.get("/pool", headers=valid_token_header)

    result = validate_response(response)
    for user_content in result["users"]:
        if user_content["user"]["spotify_id"] != logged_in_user_id:
            assert len(user_content["collections"][0]["tracks"]) == 35


@pytest.mark.slow
def should_use_all_users_pools_in_shared_pool_playback(shared_pool_code: str, test_client: TestClient,
                                                       joined_user_header: Headers,
                                                       validate_response: ValidateResponse, valid_token_header: Headers,
                                                       get_query_parameter: GetQueryParameter,
                                                       existing_pool: list[PoolMember], logged_in_user_id: str,
                                                       requests_client: Mock, mocked_pool_contents: MockedPoolContents,
                                                       weighted_parameters: RandomizationParameters,
                                                       skip_song: SkipSong, mock_playlist_fetch: MockPlaylistFetch):
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


def should_not_get_pool_share_code_from_get_pool_before_initial_share(existing_playback: list[PoolMember],
                                                                      test_client: TestClient,
                                                                      valid_token_header: Headers,
                                                                      validate_response: ValidateResponse):
    response = test_client.get("/pool", headers=valid_token_header)

    result = validate_response(response)
    assert result["share_code"] is None


def should_get_pool_share_code_from_get_pool_after_initial_share(shared_pool_code: str, test_client: TestClient,
                                                                 valid_token_header: Headers,
                                                                 joined_user_header: Headers,
                                                                 validate_response: ValidateResponse):

    for header in (valid_token_header, joined_user_header):
        response = test_client.get("/pool", headers=header)
        result = validate_response(response)
        assert result["share_code"] == shared_pool_code


def should_return_error_response_when_attempting_to_join_own_pool(shared_pool_code: str, test_client: TestClient,
                                                                  valid_token_header: Headers,
                                                                  validate_response: ValidateResponse):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=valid_token_header)

    result = validate_response(response, 400)
    assert result["detail"] == "Attempted to join own pool!"


def should_return_error_response_when_attempting_to_join_already_joined_pool(
        shared_pool_code: str, test_client: TestClient, joined_user_header: Headers,
        validate_response: ValidateResponse):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=joined_user_header)

    result = validate_response(response, 400)
    assert result["detail"] == "Already a member of that pool!"


def should_return_error_response_when_attempting_to_join_pool_with_invalid_code(
        test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse):
    invalid_code = "invalid_code_123"
    response = test_client.post(f"/pool/join/{invalid_code}", headers=valid_token_header)

    result = validate_response(response, 404)
    assert result["detail"] == f"Could not find pool with code \"{invalid_code}\""


def should_return_error_response_when_attempting_to_share_own_pool_with_existing_share_code(
        shared_pool_code: str, test_client: TestClient, valid_token_header: Headers,
        validate_response: ValidateResponse):
    response = test_client.post(f"/pool/share", headers=valid_token_header)

    result = validate_response(response, 400)
    assert result["detail"] == "Pool already shared!"


def should_return_token_in_headers_for_share_route(existing_playback: list[dict[str, Any]], test_client: TestClient,
                                                   valid_token_header: Headers,
                                                   assert_token_in_headers: AssertTokenInHeaders):
    response = test_client.post("/pool/share", headers=valid_token_header)
    assert_token_in_headers(response)


def should_return_token_in_headers_for_join_route(shared_pool_code: str, test_client: TestClient,
                                                  another_logged_in_user_header: Headers,
                                                  assert_token_in_headers: AssertTokenInHeaders):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    assert_token_in_headers(response)


@pytest.mark.asyncio
async def should_delete_joined_users_pools_on_playback_stop(
        existing_playback: list[dict[str, Any]], increment_now: IncrementNow, fixed_track_length_ms: int,
        shared_pool_code: str, db_connection: ConnectionManager, run_scheduling_job: RunSchedulingJob,
        mock_no_player_playback_state_response: MockNoPlayerStateResponse, test_client: TestClient,
        joined_user_header: Headers, requests_client_get_queue: MockResponseQueue,
        create_mock_track_search_result: MockTrackSearchResult,
        build_success_response: BuildSuccessResponse):

    track = create_mock_track_search_result()
    requests_client_get_queue.append(build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    test_client.post("/pool/content", json=pool_content_data, headers=joined_user_header)

    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_no_player_playback_state_response()

    await run_scheduling_job()

    with db_connection.session() as session:
        assert session.scalar(select(PlaybackSession)) is None
        assert session.scalar(select(Pool)) is None


def should_return_owner_user_data_on_join(shared_pool_code: str, test_client: TestClient,
                                          build_success_response: BuildSuccessResponse,
                                          create_pool_creation_data_json: CreatePoolCreationDataJson,
                                          validate_response: ValidateResponse,
                                          create_mock_track_search_result: MockTrackSearchResult,
                                          requests_client_get_queue: MockResponseQueue,
                                          another_logged_in_user_header: Headers,
                                          logged_in_user: User):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    test_client.post("/pool", json=data_json, headers=another_logged_in_user_header)

    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    assert result["owner"]["spotify_id"] == logged_in_user.spotify_id


def should_be_able_to_join_another_pool_after_creating_one(
        build_success_response: BuildSuccessResponse, another_logged_in_user_header: Headers,
        create_pool_creation_data_json: CreatePoolCreationDataJson, test_client: TestClient,
        validate_response: ValidateResponse, requests_client_get_queue: MockResponseQueue,
        create_mock_track_search_result: MockTrackSearchResult, shared_pool_code: str):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    test_client.post("/pool", json=data_json, headers=another_logged_in_user_header)

    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    pool_response = validate_response(response)
    assert len(pool_response["users"]) == 2


def should_be_able_to_create_another_pool_after_joining_one(
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: CreatePoolCreationDataJson, test_client: TestClient,
        validate_response: ValidateResponse, shared_pool_code: str,
        create_mock_track_search_result: MockTrackSearchResult,
        joined_user_header: Headers):

    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    response = test_client.post("/pool", json=data_json, headers=joined_user_header)
    pool_response = validate_response(response)
    assert pool_response["users"][0]["tracks"][0]["name"] == my_track["name"]
