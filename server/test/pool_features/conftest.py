import datetime
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
                "href": f"https://api.spotify.fake/v1/playlists/{playlist_id}/tracks?offset=0&limit=100&locale=en",
                "limit": 100,
                "next": None if track_amount < 100 else f"https://api.spotify.fake/v1/playlists/{playlist_id}/"
                                                        f"tracks?offset=100&limit=100&locale=en",
                "offset": 0,
                "previous": None,
                "total": track_amount,
                "items": playlist_tracks[:100]
            },
            "type": "playlist",
            "uri": f"spotify:playlist:{playlist_id}"
        }

        return playlist_data
    return wrapper
