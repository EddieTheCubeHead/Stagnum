from unittest.mock import Mock

import pytest
from sqlalchemy import select, and_

from api.pool.models import PoolContent
from database.entities import PoolMember


def should_create_a_pool_member_for_user_even_if_user_pool_is_empty(create_mock_track_search_result, requests_client,
                                                                    build_success_response, test_client,
                                                                    valid_token_header, validate_response):
    track = create_mock_track_search_result()
    requests_client.get = Mock(return_value=build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["tracks"]) == 1


def should_save_the_pool_member_to_database_even_if_user_pool_is_empty(create_mock_track_search_result, requests_client,
                                                                       build_success_response, test_client,
                                                                       valid_token_header, db_connection,
                                                                       logged_in_user_id):
    track = create_mock_track_search_result()
    requests_client.get = Mock(return_value=build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalar(select(PoolMember).where(PoolMember.user_id == logged_in_user_id))
    assert actual_pool_content is not None


def should_preserve_existing_pool_members_on_new_member_addition(create_mock_track_search_result, requests_client,
                                                                 build_success_response, test_client,
                                                                 valid_token_header, db_connection, logged_in_user_id,
                                                                 existing_pool):
    track = create_mock_track_search_result()
    requests_client.get = Mock(return_value=build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalars(
            select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    assert len(actual_pool_content) == len(existing_pool) + 1


def should_correctly_construct_pool_after_collection_addition(create_mock_track_search_result, requests_client,
                                                              build_success_response, test_client,
                                                              valid_token_header, db_connection, logged_in_user_id,
                                                              existing_pool, create_mock_playlist_search_result,
                                                              validate_response):
    tracks = [create_mock_track_search_result() for _ in range(35)]
    playlist = create_mock_playlist_search_result(tracks)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    pool_content_data = PoolContent(spotify_uri=playlist["uri"]).model_dump()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalars(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))).unique().all()
    assert len(actual_pool_content) == len(existing_pool) + 1
    pool_response = validate_response(response)
    assert len(pool_response["collections"][0]["tracks"]) == len(tracks)


def should_use_collection_icon_as_track_icon_on_collection_addition(create_mock_track_search_result, requests_client,
                                                                    build_success_response, test_client,
                                                                    valid_token_header, existing_pool,
                                                                    create_mock_artist_search_result,
                                                                    create_mock_album_search_result, validate_response):
    artist = create_mock_artist_search_result()
    tracks = [create_mock_track_search_result(artist) for _ in range(8)]
    album = create_mock_album_search_result(artist, tracks)
    requests_client.get = Mock(return_value=build_success_response(album))
    pool_content_data = PoolContent(spotify_uri=album["uri"]).model_dump()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    pool_response = validate_response(response)
    for track in pool_response["collections"][0]["tracks"]:
        assert track["spotify_icon_uri"] == album["images"][0]["url"]
