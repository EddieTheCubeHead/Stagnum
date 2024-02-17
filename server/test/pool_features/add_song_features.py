from unittest.mock import Mock

import pytest
from sqlalchemy import select

from api.pool.models import PoolContent
from database.entities import PoolMember


def should_create_a_pool_member_for_user_even_if_user_pool_is_empty(create_mock_track_search_result, requests_client,
                                                                    build_success_response, test_client,
                                                                    valid_token_header, validate_response):
    track = create_mock_track_search_result()
    requests_client.get = Mock(return_value=build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).dict()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["tracks"]) == 1


def should_save_the_pool_member_to_database_even_if_user_pool_is_empty(create_mock_track_search_result, requests_client,
                                                                       build_success_response, test_client,
                                                                       valid_token_header, db_connection,
                                                                       logged_in_user_id):
    track = create_mock_track_search_result()
    requests_client.get = Mock(return_value=build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).dict()

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
    pool_content_data = PoolContent(spotify_uri=track["uri"]).dict()

    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalars(
            select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    assert len(actual_pool_content) == len(existing_pool) + 1
