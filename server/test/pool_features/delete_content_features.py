from unittest.mock import Mock

from sqlalchemy import select, and_

from database.entities import PoolMember


def should_delete_track_and_return_remaining_pool_if_given_track_id(existing_pool: list[PoolMember], valid_token_header,
                                                                    validate_response, test_client):
    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["users"][0]["tracks"]) == len(existing_pool) - 1


def should_return_self_as_owner_on_deletion(existing_pool: list[PoolMember], valid_token_header,
                                            validate_response, test_client, logged_in_user):
    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    pool_response = validate_response(response)
    assert pool_response["owner"]["spotify_id"] == logged_in_user.spotify_id


def should_not_have_track_in_database_after_deletion(existing_pool: list[PoolMember], valid_token_header, test_client,
                                                     db_connection, logged_in_user_id):
    test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    assert len(all_tracks) == len(existing_pool) - 1


def should_be_able_to_delete_separate_child_from_collection(create_mock_track_search_result, test_client, db_connection,
                                                            create_mock_playlist_fetch_result, validate_response,
                                                            logged_in_user_id, valid_token_header,
                                                            create_pool_creation_data_json, requests_client_get_queue,
                                                            build_success_response):
    playlist = create_mock_playlist_fetch_result(15)
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    requests_client_get_queue.append(build_success_response(playlist))
    test_client.post("/pool", json=create_pool_creation_data_json(playlist["uri"]), headers=valid_token_header)

    response = test_client.delete(f"/pool/content/{expected_tracks[5]["uri"]}", headers=valid_token_header)
    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["collections"][0]["tracks"]) == len(expected_tracks) - 1
    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(
            and_(PoolMember.parent_id != None, PoolMember.user_id == logged_in_user_id))).unique().all()
    assert len(all_tracks) == len(expected_tracks) - 1
    with db_connection.session() as session:
        parent = session.scalar(select(PoolMember).where(PoolMember.content_uri == playlist["uri"]))
    assert parent is not None


def should_delete_all_children_on_parent_deletion(test_client, create_mock_playlist_fetch_result, validate_response,
                                                  db_connection, valid_token_header, create_pool_creation_data_json,
                                                  requests_client, logged_in_user_id, build_success_response):
    playlist = create_mock_playlist_fetch_result(15)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    test_client.post("/pool", json=create_pool_creation_data_json(playlist["uri"]), headers=valid_token_header)

    response = test_client.delete(f"/pool/content/{playlist["uri"]}", headers=valid_token_header)

    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["collections"]) == 0
    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(
            and_(PoolMember.parent_id != None, PoolMember.user_id == logged_in_user_id))).unique().all()
    assert len(all_tracks) == 0


def should_return_error_if_member_does_not_exist_in_pool(test_client, existing_pool, valid_token_header,
                                                         validate_response):
    response = test_client.delete(f"/pool/content/invalid_content_uri", headers=valid_token_header)

    json_data = validate_response(response, 404)
    assert json_data["detail"] == "Can't delete a pool member that does not exist."


def should_return_error_if_member_is_not_users_own(test_client, shared_pool_code, existing_pool,
                                                   validate_response, another_logged_in_user_header):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    response = test_client.delete(f"/pool/content/{existing_pool[1].content_uri}",
                                  headers=another_logged_in_user_header)

    json_data = validate_response(response, 400)
    assert json_data["detail"] == "Can't delete a pool member added by another user."


def should_include_token_in_headers(existing_pool: list[PoolMember], valid_token_header, test_client,
                                    assert_token_in_headers):
    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)
    assert_token_in_headers(response)
