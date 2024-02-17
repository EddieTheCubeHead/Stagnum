import random
from unittest.mock import Mock

import pytest
from sqlalchemy import select

from api.pool.models import PoolCreationData, PoolContent
from database.entities import PoolMember


@pytest.fixture
def create_pool_creation_data_json():
    def wrapper(*uris: str):
        return PoolCreationData(
            spotify_uris=[PoolContent(spotify_uri=uri) for uri in uris]
        ).dict()
    return wrapper


@pytest.fixture
def existing_pool(create_mock_track_search_result, build_success_response, requests_client,
                  create_pool_creation_data_json, test_client, validate_response, valid_token_header,
                  db_connection, logged_in_user_id) \
        -> list[PoolMember]:
    tracks = [create_mock_track_search_result() for _ in range(random.randint(10, 20))]
    responses = [build_success_response(track) for track in tracks]
    requests_client.get = Mock(side_effect=responses)
    data_json = create_pool_creation_data_json(*[track["uri"] for track in tracks])

    test_client.post("/pool", json=data_json, headers=valid_token_header)
    with db_connection.session() as session:
        members = session.scalars(select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    return members
