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
from types.callables import validate_response_callable, mock_playlist_fetch_result_callable, \
    build_success_response_callable, get_query_parameter_callable, skip_song_callable, assert_token_in_headers_callable, \
    increment_now_callable, run_scheduling_job_awaitable, mock_no_player_state_response_callable, \
    mock_track_search_result_callable, create_pool_creation_data_json_callable
from types.typed_dictionaries import Headers
from types.aliases import MockResponseQueue


def should_return_pool_code_from_share_route(existing_playback: list[dict[str, Any]], test_client: TestClient,
                                             validate_response: validate_response_callable,
                                             valid_token_header: Headers):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert result["share_code"] is not None
    assert type(result["share_code"]) == str


def should_return_not_found_from_share_route_if_user_has_no_pool(test_client: TestClient, logged_in_user: User,
                                                                 valid_token_header: Headers,
                                                                 validate_response: validate_response_callable):
    response = test_client.post("/pool/share", headers=valid_token_header)

    json_data = validate_response(response, 404)
    assert json_data["detail"] == f"Could not find pool for user {logged_in_user.spotify_username}"


def should_have_only_uppercase_letters_and_digits_in_share_code(existing_playback: list[dict[str, Any]],
                                                                test_client: TestClient,
                                                                validate_response: validate_response_callable,
                                                                valid_token_header: Headers):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    for char in result["share_code"]:
        assert char.isupper() or char.isdigit()


def should_have_eight_characters_in_share_code(existing_playback: list[dict[str, Any]], test_client: TestClient,
                                               validate_response: validate_response_callable,
                                               valid_token_header: Headers):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert len(result["share_code"]) == 8


def should_be_able_to_join_shared_pool_with_code(shared_pool_code: str, test_client: TestClient,
                                                 another_logged_in_user_header: Headers,
                                                 validate_response: validate_response_callable):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    assert len(result["users"]) == 2
    assert result["share_code"] == shared_pool_code


def should_see_pool_existing_songs_when_joining_shared_pool(shared_pool_code: str, test_client: TestClient,
                                                            another_logged_in_user_header: Headers,
                                                            validate_response: validate_response_callable,
                                                            logged_in_user_id: str, existing_pool: list[PoolMember]):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    for user_content in result["users"]:
        if user_content["user"]["spotify_id"] == logged_in_user_id:
            assert len(user_content["tracks"]) == len(existing_pool)


def should_show_added_songs_to_pool_main_user(shared_pool_code: str, test_client: TestClient,
                                              another_logged_in_user_header: Headers, requests_client: Mock,
                                              validate_response: validate_response_callable, logged_in_user_id: str,
                                              valid_token_header: Headers, existing_pool: list[PoolMember],
                                              create_mock_playlist_fetch_result: mock_playlist_fetch_result_callable,
                                              build_success_response: build_success_response_callable):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    playlist = create_mock_playlist_fetch_result(35)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    pool_content_data = PoolContent(spotify_uri=playlist["uri"]).model_dump()
    test_client.post("/pool/content", json=pool_content_data, headers=another_logged_in_user_header)

    response = test_client.get("/pool", headers=valid_token_header)

    result = validate_response(response)
    for user_content in result["users"]:
        if user_content["user"]["spotify_id"] != logged_in_user_id:
            assert len(user_content["collections"][0]["tracks"]) == 35


@pytest.mark.slow
@pytest.mark.parametrize("existing_pool", [15], indirect=True)
def should_use_all_users_pools_in_shared_pool_playback(
        shared_pool_code: str, test_client: TestClient, another_logged_in_user_header: Headers,
        validate_response: validate_response_callable, valid_token_header: Headers,
        existing_pool: list[PoolMember], logged_in_user_id: str, requests_client: Mock,
        create_mock_playlist_fetch_result: mock_playlist_fetch_result_callable,
        build_success_response: build_success_response_callable, get_query_parameter: get_query_parameter_callable,
        weighted_parameters: RandomizationParameters, skip_song: skip_song_callable,
        requests_client_get_queue: MockResponseQueue):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    playlist = create_mock_playlist_fetch_result(15)
    requests_client_get_queue.append(build_success_response(playlist))
    pool_content_data = PoolContent(spotify_uri=playlist["uri"]).model_dump()
    test_client.post("/pool/content", json=pool_content_data, headers=another_logged_in_user_header)

    original_user_played_uris = set()
    for _ in range(99):
        skip_song(valid_token_header)
        actual_queue_call = requests_client.post.call_args_list[-2]
        original_user_played_uris.add(get_query_parameter(actual_queue_call.args[0], "uri"))

    joined_user_played_uris = set()
    for _ in range(99):
        skip_song(another_logged_in_user_header)
        actual_queue_call = requests_client.post.call_args_list[-2]
        joined_user_played_uris.add(get_query_parameter(actual_queue_call.args[0], "uri"))

    original_user_track_uris = [track.content_uri for track in existing_pool]
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
                                                                      validate_response: validate_response_callable):
    response = test_client.get("/pool", headers=valid_token_header)

    result = validate_response(response)
    assert result["share_code"] is None


def should_get_pool_share_code_from_get_pool_after_initial_share(shared_pool_code: str, test_client: TestClient,
                                                                 valid_token_header: Headers,
                                                                 another_logged_in_user_header: Headers,
                                                                 validate_response: validate_response_callable):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    for header in (valid_token_header, another_logged_in_user_header):
        response = test_client.get("/pool", headers=header)
        result = validate_response(response)
        assert result["share_code"] == shared_pool_code


def should_return_error_response_when_attempting_to_join_own_pool(shared_pool_code: str, test_client: TestClient,
                                                                  valid_token_header: Headers,
                                                                  validate_response: validate_response_callable):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=valid_token_header)

    result = validate_response(response, 400)
    assert result["detail"] == "Attempted to join own pool!"


def should_return_error_response_when_attempting_to_join_already_joined_pool(
        shared_pool_code: str, test_client: TestClient, another_logged_in_user_header: Headers,
        validate_response: validate_response_callable):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response, 400)
    assert result["detail"] == "Already a member of that pool!"


def should_return_error_response_when_attempting_to_join_pool_with_invalid_code(
        test_client: TestClient, valid_token_header: Headers, validate_response: validate_response_callable):
    invalid_code = "invalid_code_123"
    response = test_client.post(f"/pool/join/{invalid_code}", headers=valid_token_header)

    result = validate_response(response, 404)
    assert result["detail"] == f"Could not find pool with code \"{invalid_code}\""


def should_return_error_response_when_attempting_to_share_own_pool_with_existing_share_code(
        shared_pool_code: str, test_client: TestClient, valid_token_header: Headers,
        validate_response: validate_response_callable):
    response = test_client.post(f"/pool/share", headers=valid_token_header)

    result = validate_response(response, 400)
    assert result["detail"] == "Pool already shared!"


def should_return_token_in_headers_for_share_route(existing_playback: list[dict[str, Any]], test_client: TestClient,
                                                   valid_token_header: Headers,
                                                   assert_token_in_headers: assert_token_in_headers_callable):
    response = test_client.post("/pool/share", headers=valid_token_header)
    assert_token_in_headers(response)


def should_return_token_in_headers_for_join_route(shared_pool_code: str, test_client: TestClient,
                                                  another_logged_in_user_header: Headers,
                                                  assert_token_in_headers: assert_token_in_headers_callable):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    assert_token_in_headers(response)


@pytest.mark.asyncio
async def should_delete_joined_users_pools_on_playback_stop(
        existing_playback: list[dict[str, Any]], increment_now: increment_now_callable, fixed_track_length_ms: int,
        shared_pool_code: str, db_connection: ConnectionManager, run_scheduling_job: run_scheduling_job_awaitable,
        mock_no_player_playback_state_response: mock_no_player_state_response_callable, test_client: TestClient,
        another_logged_in_user_header: Headers, requests_client_get_queue: MockResponseQueue,
        create_mock_track_search_result: mock_track_search_result_callable,
        build_success_response: build_success_response_callable):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    track = create_mock_track_search_result()
    requests_client_get_queue.append(build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    test_client.post("/pool/content", json=pool_content_data, headers=another_logged_in_user_header)

    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))
    mock_no_player_playback_state_response()

    await run_scheduling_job()

    with db_connection.session() as session:
        assert session.scalar(select(PlaybackSession)) is None
        assert session.scalar(select(Pool)) is None


def should_return_owner_user_data_on_join(shared_pool_code: str, test_client: TestClient,
                                          build_success_response: build_success_response_callable,
                                          create_pool_creation_data_json: create_pool_creation_data_json_callable,
                                          validate_response: validate_response_callable,
                                          create_mock_track_search_result: mock_track_search_result_callable,
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
        build_success_response: build_success_response_callable, another_logged_in_user_header: Headers,
        create_pool_creation_data_json: create_pool_creation_data_json_callable, test_client: TestClient,
        validate_response: validate_response_callable, requests_client_get_queue: MockResponseQueue,
        create_mock_track_search_result: mock_track_search_result_callable, shared_pool_code: str):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    test_client.post("/pool", json=data_json, headers=another_logged_in_user_header)

    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    pool_response = validate_response(response)
    assert len(pool_response["users"]) == 2

def should_be_able_to_create_another_pool_after_joining_one(
        build_success_response: build_success_response_callable, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: create_pool_creation_data_json_callable, test_client: TestClient,
        validate_response: validate_response_callable, shared_pool_code: str,
        create_mock_track_search_result: mock_track_search_result_callable,
        another_logged_in_user_header: Headers):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    response = test_client.post("/pool", json=data_json, headers=another_logged_in_user_header)
    pool_response = validate_response(response)
    assert pool_response["users"][0]["tracks"][0]["name"] == my_track["name"]
