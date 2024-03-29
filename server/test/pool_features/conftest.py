import datetime
import random
from unittest.mock import Mock

import pytest
from sqlalchemy import select
from starlette.testclient import TestClient

from api.auth.dependencies import AuthDatabaseConnection
from api.common.models import ParsedTokenResponse
from api.pool.models import PoolCreationData, PoolContent
from database.database_connection import ConnectionManager
from database.entities import PoolMember, User


@pytest.fixture
def create_pool_creation_data_json():
    def wrapper(*uris: str):
        return PoolCreationData(
            spotify_uris=[PoolContent(spotify_uri=uri) for uri in uris]
        ).model_dump()

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


@pytest.fixture
def create_mock_playlist_fetch_result(create_mock_track_search_result, faker):
    def wrapper(track_amount: int):
        user = faker.name().replace(" ", "")
        playlist_id = faker.uuid4()
        tracks = [create_mock_track_search_result() for _ in range(track_amount)]
        playlist_tracks = []
        for track in tracks:
            playlist_tracks.append({
                "added_at": datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%dT%H:%M:%SZ"),
                "added_by": {
                    "external_urls": {
                        "spotify": f"https://fake.spotify.com/users/{user}"
                    },
                    "href": f"https://api.spotify.fake/v1/users/{user}",
                    "id": user,
                    "type": "user",
                    "uri": f"spotify:user:{user}"
                },
                "is_local": False,
                "track": track
            })
        batch = 100
        playlist_data = {
            "collaborative": False,
            "description": faker.paragraph(),
            "external_urls": {
                "spotify": f"https://fake.spotify.fake/playlist/{playlist_id}"
            },
            "followers": {
                "href": None,
                "total": random.randint(0, 9999)
            },
            "href": f"https://api.spotify.fake/v1/playlists/{playlist_id}?locale=en",
            "id": playlist_id,
            "images": [
                {
                    "url": f"https://image-cdn-fa.spotifycdn.fake/image/{faker.uuid4()}",
                    "height": None,
                    "width": None
                }
            ],
            "name": faker.text(max_nb_chars=25)[:-1],
            "owner": {
                "external_urls": {
                    "spotify": f"https://fake.spotify.com/users/{user}"
                },
                "href": f"https://api.spotify.fake/v1/users/{user}",
                "id": user,
                "type": "user",
                "uri": f"spotify:user:{user}",
                "display_name": user
            },
            "public": True,
            "snapshot_id": faker.uuid4(),
            "tracks": {
                "href": f"https://api.spotify.fake/v1/playlists/{playlist_id}/tracks?offset=0&limit={batch}&locale=en",
                "limit": batch,
                "next": None if track_amount < batch else f"https://api.spotify.fake/v1/playlists/{playlist_id}/"
                                                          f"tracks?offset={batch}&limit={batch}&locale=en",
                "offset": 0,
                "previous": None,
                "total": track_amount,
                "items": playlist_tracks[:batch]
            },
            "type": "playlist",
            "uri": f"spotify:playlist:{playlist_id}"
        }

        if track_amount <= batch:
            return playlist_data

        further_fetches = []
        batch_walker = batch
        while batch_walker <= track_amount:
            further_fetches.append({
                "href": f"https://api.spotify.fake/v1/playlists/{playlist_id}/tracks"
                        f"?offset={batch_walker}&limit={batch}&locale=en",
                "limit": batch,
                "next": None if track_amount < batch_walker + batch
                            else f"https://api.spotify.fake/v1/playlists/{playlist_id}/tracks"
                                 f"?offset={batch_walker + batch}&limit={batch}&locale=en",
                "offset": batch_walker,
                "previous": f"https://api.spotify.fake/v1/playlists/{playlist_id}/tracks"
                                 f"?offset={batch_walker - batch}&limit={batch}&locale=en",
                "total": track_amount,
                "items": playlist_tracks[batch_walker:batch_walker + batch]
            })
            batch_walker += batch
        return playlist_data, *further_fetches

    return wrapper


@pytest.fixture
def fixed_track_length_ms(minutes: int = 3, seconds: int = 30):
    return (minutes * 60 + seconds) * 1000


@pytest.fixture
def existing_playback(db_connection: ConnectionManager, create_mock_track_search_result,
                      build_success_response, requests_client, create_pool_creation_data_json,
                      test_client: TestClient, valid_token_header, fixed_track_length_ms):
    tracks = [create_mock_track_search_result() for _ in range(15)]
    for track in tracks:
        track["duration_ms"] = fixed_track_length_ms
    responses = [build_success_response(track) for track in tracks]
    requests_client.get = Mock(side_effect=responses)
    track_uris = [track["uri"] for track in tracks]
    data_json = create_pool_creation_data_json(*track_uris)
    test_client.post("/pool", json=data_json, headers=valid_token_header)
    return tracks


@pytest.fixture
def another_logged_in_user_header(faker, db_connection):
    auth_database_connection = AuthDatabaseConnection(db_connection)
    user_id = faker.uuid4()
    user = User(spotify_id=user_id, spotify_username=user_id, spotify_avatar_url=f"user.icon.example")
    token_data = ParsedTokenResponse(token="my test token 2", refresh_token="my refresh token 2", expires_in=999999)
    auth_database_connection.update_logged_in_user(user, token_data)
    return {"token": token_data.token}


@pytest.fixture
def shared_pool_code(existing_playback, test_client, valid_token_header, validate_response) -> str:
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    return result["share_code"]
