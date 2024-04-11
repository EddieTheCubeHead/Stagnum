import datetime
from unittest.mock import Mock

import pytest
from sqlalchemy import select

from api.pool.models import PoolContent
from database.entities import PlaybackSession, Pool


def should_return_pool_code_from_share_route(existing_playback, test_client, validate_response, valid_token_header):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert result["share_code"] is not None
    assert type(result["share_code"]) == str


def should_have_only_uppercase_letters_and_digits_in_share_code(existing_playback, test_client, validate_response,
                                                                valid_token_header):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    for char in result["share_code"]:
        assert char.isupper() or char.isdigit()


def should_have_eight_characters_in_share_code(existing_playback, test_client, validate_response, valid_token_header):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert len(result["share_code"]) == 8


def should_be_able_to_join_shared_pool_with_code(shared_pool_code, test_client, another_logged_in_user_header,
                                                 validate_response):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    assert len(result["users"]) == 2
    assert result["share_code"] == shared_pool_code


def should_see_pool_existing_songs_when_joining_shared_pool(shared_pool_code, test_client,
                                                            another_logged_in_user_header, validate_response,
                                                            logged_in_user_id, existing_pool):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response)
    for user_content in result["users"]:
        if user_content["user"]["spotify_id"] == logged_in_user_id:
            assert len(user_content["tracks"]) == len(existing_pool)


def should_show_added_songs_to_pool_main_user(shared_pool_code, test_client, another_logged_in_user_header,
                                              validate_response, valid_token_header, existing_pool, logged_in_user_id,
                                              create_mock_playlist_fetch_result, requests_client,
                                              build_success_response):
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
def should_use_all_users_pools_in_shared_pool_playback(shared_pool_code, test_client, another_logged_in_user_header,
                                                       validate_response, valid_token_header, existing_pool,
                                                       logged_in_user_id, create_mock_playlist_fetch_result,
                                                       requests_client, build_success_response, get_query_parameter,
                                                       weighted_parameters, skip_song, requests_client_get_queue):
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


def should_not_get_pool_share_code_from_get_pool_before_initial_share(existing_playback, test_client,
                                                                      valid_token_header, validate_response):
    response = test_client.get("/pool", headers=valid_token_header)

    result = validate_response(response)
    assert result["share_code"] is None


def should_get_pool_share_code_from_get_pool_after_initial_share(shared_pool_code, test_client, valid_token_header,
                                                                 another_logged_in_user_header, validate_response):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    for header in (valid_token_header, another_logged_in_user_header):
        response = test_client.get("/pool", headers=header)
        result = validate_response(response)
        assert result["share_code"] == shared_pool_code


def should_return_error_response_when_attempting_to_join_own_pool(shared_pool_code, test_client, valid_token_header,
                                                                  validate_response):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=valid_token_header)

    result = validate_response(response, 400)
    assert result["detail"] == "Attempted to join own pool!"


def should_return_error_response_when_attempting_to_join_already_joined_pool(shared_pool_code, test_client,
                                                                             another_logged_in_user_header,
                                                                             validate_response):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    result = validate_response(response, 400)
    assert result["detail"] == "Already a member of that pool!"


def should_return_error_response_when_attempting_to_share_own_pool_with_existing_share_code(shared_pool_code,
                                                                                            test_client,
                                                                                            valid_token_header,
                                                                                            validate_response):
    response = test_client.post(f"/pool/share", headers=valid_token_header)

    result = validate_response(response, 400)
    assert result["detail"] == "Pool already shared!"


def should_return_token_in_headers_for_share_route(existing_playback, test_client, valid_token_header,
                                                   assert_token_in_headers):
    response = test_client.post("/pool/share", headers=valid_token_header)
    assert_token_in_headers(response)


def should_return_token_in_headers_for_join_route(shared_pool_code, test_client, another_logged_in_user_header,
                                                  assert_token_in_headers):
    response = test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    assert_token_in_headers(response)


@pytest.mark.asyncio
async def should_delete_joined_users_pools_on_playback_stop(existing_playback, increment_now, fixed_track_length_ms,
                                                            valid_token_header, requests_client, db_connection,
                                                            run_scheduling_job, mock_no_player_playback_state_response,
                                                            another_logged_in_user_header, test_client,
                                                            shared_pool_code, create_mock_track_search_result,
                                                            requests_client_get_queue, build_success_response):
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
