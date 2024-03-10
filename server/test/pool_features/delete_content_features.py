from unittest.mock import Mock

from sqlalchemy import select, and_

from database.entities import PoolMember


def should_delete_track_and_return_remaining_pool_if_given_track_id(existing_pool: list[PoolMember], valid_token_header,
                                                                    validate_response, test_client):
    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["tracks"]) == len(existing_pool) - 1


def should_not_have_track_in_database_after_deletion(existing_pool: list[PoolMember], valid_token_header, test_client,
                                                     db_connection, logged_in_user_id):
    test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    assert len(all_tracks) == len(existing_pool) - 1


def should_be_able_to_delete_separate_child_from_collection(create_mock_track_search_result, test_client, db_connection,
                                                            create_mock_playlist_fetch_result, validate_response,
                                                            logged_in_user_id, valid_token_header,
                                                            create_pool_creation_data_json, requests_client,
                                                            build_success_response):
    playlist = create_mock_playlist_fetch_result(15)
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    requests_client.get = Mock(return_value=build_success_response(playlist))
    test_client.post("/pool", json=create_pool_creation_data_json(playlist["uri"]), headers=valid_token_header)

    response = test_client.delete(f"/pool/content/{expected_tracks[5]["uri"]}", headers=valid_token_header)
    pool_response = validate_response(response)
    assert len(pool_response["collections"][0]["tracks"]) == len(expected_tracks) - 1
    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(
            and_(PoolMember.parent_id != None, PoolMember.user_id == logged_in_user_id))).unique().all()
    assert len(all_tracks) == len(expected_tracks) - 1
    with db_connection.session() as session:
        parent = session.scalar(select(PoolMember).where(PoolMember.content_uri == playlist["uri"]))
    assert parent is not None


def should_delete_all_children_on_parent_deletion(create_mock_track_search_result, test_client, db_connection,
                                                  create_mock_playlist_fetch_result, validate_response,
                                                  logged_in_user_id, valid_token_header, create_pool_creation_data_json,
                                                  requests_client, build_success_response):
    playlist = create_mock_playlist_fetch_result(15)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    test_client.post("/pool", json=create_pool_creation_data_json(playlist["uri"]), headers=valid_token_header)

    response = test_client.delete(f"/pool/content/{playlist["uri"]}", headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["collections"]) == 0
    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(
            and_(PoolMember.parent_id != None, PoolMember.user_id == logged_in_user_id))).unique().all()
    assert len(all_tracks) == 0
