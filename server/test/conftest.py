import json
import random
import re
from typing import Callable
from unittest.mock import Mock

import pytest
from fastapi import FastAPI
from starlette.testclient import TestClient

from api.application import create_app
from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import RequestsClientRaw, TokenHolder, TokenHolderRaw, UserDatabaseConnection
from api.common.models import ParsedTokenResponse
from database.database_connection import ConnectionManager
from database.entities import User


@pytest.fixture
def application() -> FastAPI:
    return create_app()


@pytest.fixture
def requests_client():
    return Mock()


@pytest.fixture
def db_connection(tmp_path, pytestconfig, monkeypatch) -> ConnectionManager:
    echo = "-v" in pytestconfig.invocation_params.args
    monkeypatch.setenv("DATABASE_CONNECTION_URL", f"sqlite:///{tmp_path}/test_db")
    monkeypatch.setenv("VERBOSE_SQLALCHEMY", str(echo))
    connection = ConnectionManager()
    return connection


@pytest.fixture
def application_with_dependencies(application, requests_client, db_connection):
    application.dependency_overrides[RequestsClientRaw] = lambda: requests_client
    application.dependency_overrides[ConnectionManager] = lambda: db_connection
    return application


@pytest.fixture
def test_client(application_with_dependencies) -> TestClient:
    test_client = TestClient(application_with_dependencies)
    return test_client


@pytest.fixture
def validate_response():
    def wrapper(response, code: int = 200):
        assert response.status_code == code, f"Expected response with status code {code}, got {response.status_code}"
        return json.loads(response.content.decode("utf-8"))

    return wrapper


@pytest.fixture
def mock_token_holder(application, db_connection):
    user_database_connection = UserDatabaseConnection(db_connection)
    token_holder = TokenHolder(user_database_connection)
    application.dependency_overrides[TokenHolderRaw] = lambda: token_holder
    return token_holder


@pytest.fixture
def create_token(faker) -> Callable[[], ParsedTokenResponse]:
    def wrapper() -> ParsedTokenResponse:
        token = faker.uuid4()
        return ParsedTokenResponse(token=f"Bearer {token}", refresh_token=f"Refresh {token}", expires_in=999999)
    
    return wrapper


@pytest.fixture
def primary_user_token(create_token) -> ParsedTokenResponse:
    return create_token()


@pytest.fixture
def logged_in_user(logged_in_user_id) -> User:
    return User(spotify_id=logged_in_user_id, spotify_username=logged_in_user_id,
                spotify_avatar_url=f"user.icon.example")


@pytest.fixture
def auth_database_connection(db_connection) -> AuthDatabaseConnection:
    return AuthDatabaseConnection(db_connection)


@pytest.fixture
def log_user_in(auth_database_connection) -> Callable[[User, ParsedTokenResponse], None]:
    def wrapper(user: User, token: ParsedTokenResponse):
        auth_database_connection.update_logged_in_user(user, token)

    return wrapper


@pytest.fixture
def create_header_from_token_response() -> Callable[[ParsedTokenResponse], dict[str, str]]:
    def wrapper(token_response: ParsedTokenResponse) -> dict[str, str]:
        return {"token": token_response.token}

    return wrapper


@pytest.fixture
def valid_token_header(log_user_in, logged_in_user, primary_user_token, create_header_from_token_response):
    log_user_in(logged_in_user, primary_user_token)
    return create_header_from_token_response(primary_user_token)


@pytest.fixture
def logged_in_user_id(faker):
    user_id = faker.uuid4()
    return user_id


@pytest.fixture
def build_success_response():
    def wrapper(data: dict):
        response = Mock()
        response.status_code = 200
        response.content = json.dumps(data).encode("utf-8")
        return response

    return wrapper


_DATE_PATTERN = "%Y-%m"


@pytest.fixture
def create_mock_artist_search_result(faker):
    def wrapper():
        artist_name = faker.name()
        artist_id = faker.uuid4()
        return {
            "external_urls": {
                "spotify": f"https://artist.url.spotify.com/{artist_id}"
            },
            "followers": {
                "href": f"spotify:artist_followers:{artist_id}",
                "total": random.randint(1, 999_999_999)
            },
            "genres": ["Prog rock"],
            "href": f"https://spotify.api/resource:artist:{artist_id}",
            "id": artist_id,
            "images": [
                {
                    "url": f"https://pic.spotify.url/{artist_name}",
                    "height": 300,
                    "width": 300
                }
            ],
            "name": artist_name,
            "popularity": random.randint(1, 10),
            "type": "artist",
            "uri": f"spotify:artist:{artist_id}"
        }

    return wrapper


@pytest.fixture
def create_mock_album_search_result(faker):
    def wrapper(artist: dict, tracks: list[dict] | None = None):
        album_name = faker.text(max_nb_chars=25)[:-1]
        album_id = faker.uuid4()
        album_release_date = faker.date(pattern=_DATE_PATTERN)
        album_data = {
            "album_type": "normal",
            "total_tracks": random.randint(4, 20),
            "available_markets": ["FI"],
            "external_urls": {
                "spotify": f"https://album.url.spotify.com/{album_id}"
            },
            "href": f"https://spotify.api/resource:album:{album_id}",
            "id": album_id,
            "images": [
                {
                    "url": f"https://pic.spotify.url/{album_name}",
                    "height": 300,
                    "width": 300
                }
            ],
            "name": album_name,
            "release_date": album_release_date,
            "release_date_precision": "year",
            "restrictions": {
                "reason": "market"
            },
            "type": "album",
            "uri": f"spotify:album:{album_id}",
            "artists": [
                {
                    "external_urls": artist["external_urls"],
                    "href": artist["href"],
                    "id": artist["id"],
                    "name": artist["name"],
                    "type": "artist",
                    "uri": artist["uri"]
                },
            ]
        }
        if tracks is not None:
            [track.pop("album", None) for track in tracks]
            album_data["tracks"] = {
                "href": f"{album_data['href']}/tracks?offset=0&limit=20",
                "limit": 20,
                "next": f"{album_data['href']}/tracks?offset=20&limit=20",
                "offset": 0,
                "previous": None,
                "total": len(tracks) + random.randint(1, 20),
                "items": tracks
            }
        return album_data

    return wrapper


@pytest.fixture
def create_mock_track_search_result(faker, create_mock_artist_search_result, create_mock_album_search_result):
    def wrapper(artist_in: dict | None = None):
        track_name = faker.text(max_nb_chars=25)[:-1]
        track_id = faker.uuid4()
        artist = artist_in if artist_in is not None else create_mock_artist_search_result()
        album = create_mock_album_search_result(artist)
        return {
            "album": album,
            "artists": [artist],
            "available_markets": ["FI"],
            "disc_number": 0,
            "duration_ms": random.randint(120_000, 360_000),
            "explicit": random.choice((True, False)),
            "external_ids": {
                "isrc": f"isrc:{track_id}",
                "ean": f"ean:{track_id}",
                "upc": f"upc:{track_id}"
            },
            "external_urls": {
                "spotify": f"https://track.url.spotify/{track_id}"
            },
            "href": f"https://spotify.api/resource:track:{track_id}",
            "id": track_id,
            "is_playable": True,
            "linked_from": {},
            "restrictions": {
                "reason": "market"
            },
            "name": track_name,
            "popularity": random.randint(1, 10),
            "preview_url": f"https://track.preview.spotify/{track_id}",
            "track_number": random.randint(1, album["total_tracks"]),
            "type": "track",
            "uri": f"spotify:track:{track_id}",
            "is_local": False
        }

    return wrapper


@pytest.fixture
def create_mock_playlist_search_result(faker):
    def wrapper(tracks: list[dict] | None = None):
        playlist_id = faker.uuid4()
        playlist_name = faker.text(max_nb_chars=25)[:-1]
        playlist_owner = faker.name()
        playlist_owner_id = faker.uuid4()
        playlist_data = {
            "collaborative": random.choice((True, False)),
            "description": faker.paragraph(nb_sentences=2),
            "external_urls": {
                "spotify": f"https://playlist.url.spotify/{playlist_id}"
            },
            "href": f"https://spotify.api/resource:playlist:{playlist_id}",
            "id": playlist_id,
            "images": [
                {
                    "url": f"https://pic.spotify.url/{playlist_name}",
                    "height": 300,
                    "width": 300
                }
            ],
            "name": playlist_name,
            "owner": {
                "external_urls": {
                    "spotify": f"https://user.url.spotify/{playlist_owner}"
                },
                "followers": {
                    "href": f"https://spotify.api/resource:followers:{playlist_owner_id}",
                    "total": random.randint(1, 999)
                },
                "href": f"https://spotify.api/resource:user:{playlist_owner_id}",
                "id": playlist_owner_id,
                "type": "user",
                "uri": f"spotify:user:{playlist_owner_id}",
                "display_name": playlist_owner
            },
            "public": random.choice((True, False)),
            "snapshot_id": faker.uuid4(),
            "tracks": {
                "href": f"https://spotify.api/resource:playlist_tracks:{playlist_id}",
                "total": random.randint(1, 5000)
            },
            "type": "playlist",
            "uri": f"spotify:playlist:{playlist_id}"
        }
        if tracks is not None:
            playlist_data["tracks"] = {
                "href": f"{playlist_data['href']}/tracks?offset=0&limit=50",
                "limit": 50,
                "next": f"{playlist_data['href']}/tracks?offset=50&limit=50",
                "offset": 0,
                "previous": None,
                "total": len(tracks) + random.randint(1, 20),
                "items": tracks
            }
        return playlist_data

    return wrapper


@pytest.fixture
def get_query_parameter():
    restricted_characters = r"&"

    def wrapper(query_string, parameter_name) -> str:
        match = re.match(fr".*[&?]{parameter_name}=([^{restricted_characters}]+)(?:$|&.*)", query_string)
        assert match, f"Could not find query parameter {parameter_name} in query '{query_string}'"
        return match.group(1)

    return wrapper
