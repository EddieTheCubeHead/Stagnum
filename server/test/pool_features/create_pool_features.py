import json
from unittest.mock import Mock

import pytest
from sqlalchemy import select
from starlette.testclient import TestClient

from api.pool.models import PoolContent, PoolCreationData
from database.database_connection import ConnectionManager
from database.entities import PoolMember


@pytest.fixture
def create_pool_creation_data_json():
    def wrapper(uri: str):
        return PoolCreationData(
            spotify_uris=[
                PoolContent(spotify_uri=uri)
            ]
        ).dict()
    return wrapper



def should_create_pool_of_one_song_when_post_pool_called_with_single_song_id(test_client: TestClient,
                                                                             valid_token_header,
                                                                             validate_response,
                                                                             create_mock_track_search_result,
                                                                             build_success_response,
                                                                             requests_client,
                                                                             create_pool_creation_data_json):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client.get = Mock(return_value=build_success_response(my_track))
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    pool_response = validate_response(response)
    assert pool_response["tracks"][0]["name"] == my_track["name"]


def should_save_pool_in_database_with_user_id_when_created(test_client: TestClient, db_connection: ConnectionManager,
                                                           valid_token_header, create_mock_track_search_result,
                                                           build_success_response, requests_client, logged_in_user_id,
                                                           create_pool_creation_data_json):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client.get = Mock(return_value=build_success_response(my_track))
    test_client.post("/pool", json=data_json, headers=valid_token_header)
    with db_connection.session() as session:
        actual_pool_content = session.scalar(select(PoolMember).where(PoolMember.user_id == logged_in_user_id))
    assert actual_pool_content is not None


@pytest.mark.wip
def should_be_able_to_create_pool_from_album(test_client: TestClient, db_connection: ConnectionManager,
                                             valid_token_header, create_mock_album_search_result, validate_response,
                                             create_mock_track_search_result, create_mock_artist_search_result,
                                             build_success_response, requests_client, create_pool_creation_data_json):
    artist = create_mock_artist_search_result()
    tracks = [create_mock_track_search_result(artist) for _ in range(12)]
    album = create_mock_album_search_result(artist, tracks)
    requests_client.get = Mock(return_value=build_success_response(album))

    data_json = create_pool_creation_data_json(album["uri"])

    result = test_client.post("/pool", json=data_json, headers=valid_token_header)
    pool_response = validate_response(result)
    assert pool_response["tracks"] == []
    assert len(pool_response["collections"][0]["tracks"]) == len(tracks)
    for expected_track, actual_track in zip(tracks, pool_response["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]
