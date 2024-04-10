import datetime
import json
import random
import re
from dataclasses import dataclass
from typing import Callable, override
from unittest.mock import Mock

import pytest
from _pytest.python_api import ApproxBase
from fastapi import FastAPI
from sqlalchemy import select
from starlette.responses import Response
from starlette.testclient import TestClient

from api.application import create_app
from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import RequestsClientRaw, TokenHolder, TokenHolderRaw, UserDatabaseConnection, \
    AuthSpotifyClient, SpotifyClient, DateTimeWrapperRaw, DateTimeWrapper
from api.common.models import ParsedTokenResponse
from api.pool.models import PoolCreationData, PoolContent
from database.database_connection import ConnectionManager
from database.entities import User, PoolMember


@pytest.fixture
def application() -> FastAPI:
    return create_app()


@pytest.fixture
def requests_client():
    mock_response = Mock()
    mock_response.content = json.dumps({"default": "test_response"}).encode("utf-8")
    mock_response.status_code = 200
    mock_client = Mock()
    mock_client.put = Mock(return_value=mock_response)
    mock_client.post = Mock(return_value=mock_response)
    mock_client.get = Mock(return_value=mock_response)
    return mock_client


@pytest.fixture
def requests_client_get_queue(requests_client) -> [Response]:
    queue = []
    requests_client.get = Mock(side_effect=queue)
    return queue


@pytest.fixture
def requests_client_post_queue(requests_client) -> [Response]:
    queue = []
    requests_client.post = Mock(side_effect=queue)
    return queue


@pytest.fixture
def requests_client_put_queue(requests_client) -> [Response]:
    queue = []
    requests_client.put = Mock(side_effect=queue)
    return queue


@pytest.fixture
def db_connection(tmp_path, pytestconfig, monkeypatch) -> ConnectionManager:
    echo = "-v" in pytestconfig.invocation_params.args
    monkeypatch.setenv("DATABASE_CONNECTION_URL", f"sqlite:///{tmp_path}/test_db")
    monkeypatch.setenv("VERBOSE_SQLALCHEMY", str(echo))
    connection = ConnectionManager()
    return connection


@pytest.fixture
def application_with_dependencies(application, requests_client, db_connection, mock_datetime_wrapper):
    application.dependency_overrides[RequestsClientRaw] = lambda: requests_client
    application.dependency_overrides[ConnectionManager] = lambda: db_connection
    application.dependency_overrides[DateTimeWrapperRaw] = lambda: mock_datetime_wrapper
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
def spotify_client(requests_client):
    return SpotifyClient(requests_client)


@pytest.fixture
def auth_spotify_client(spotify_client):
    return AuthSpotifyClient(spotify_client)


@pytest.fixture
def mock_token_holder(application, db_connection, auth_spotify_client, mock_datetime_wrapper):
    user_database_connection = UserDatabaseConnection(db_connection, mock_datetime_wrapper)
    token_holder = TokenHolder(user_database_connection, auth_spotify_client, mock_datetime_wrapper, None)
    application.dependency_overrides[TokenHolderRaw] = lambda: token_holder
    return token_holder


@pytest.fixture
def create_token(faker) -> Callable[[], ParsedTokenResponse]:
    def wrapper() -> ParsedTokenResponse:
        token = faker.uuid4()
        return ParsedTokenResponse(token=f"Bearer {token}", refresh_token=f"Refresh {token}", expires_in=3600)
    
    return wrapper


@pytest.fixture
def primary_user_token(create_token) -> ParsedTokenResponse:
    return create_token()


@pytest.fixture
def logged_in_user(logged_in_user_id) -> User:
    return User(spotify_id=logged_in_user_id, spotify_username=logged_in_user_id,
                spotify_avatar_url=f"user.icon.example")


@pytest.fixture
def auth_database_connection(db_connection, mock_datetime_wrapper) -> AuthDatabaseConnection:
    return AuthDatabaseConnection(db_connection, mock_datetime_wrapper)


@pytest.fixture
def log_user_in(auth_database_connection) -> Callable[[User, ParsedTokenResponse], None]:
    def wrapper(user: User, token: ParsedTokenResponse):
        auth_database_connection.update_logged_in_user(user, token)

    return wrapper


@pytest.fixture
def create_header_from_token_response() -> Callable[[ParsedTokenResponse], dict[str, str]]:
    def wrapper(token_response: ParsedTokenResponse) -> dict[str, str]:
        return {"Authorization": token_response.token}

    return wrapper


@pytest.fixture
def valid_token_header(log_user_in, logged_in_user, primary_user_token, create_header_from_token_response):
    log_user_in(logged_in_user, primary_user_token)
    return create_header_from_token_response(primary_user_token)


@pytest.fixture
def valid_token(log_user_in, logged_in_user, primary_user_token, create_header_from_token_response):
    log_user_in(logged_in_user, primary_user_token)
    return primary_user_token.token


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



@dataclass
class ErrorData:
    message: str
    code: int


@pytest.fixture(params=[401, 403, 404, 500])
def spotify_error_message(request, requests_client) -> ErrorData:
    code = request.param
    expected_error_message = "my error message"
    for mock_method in (requests_client.get, requests_client.post, requests_client.put):
        mock_return = Mock()
        mock_return.status_code = code
        mock_return.content = json.dumps({"error": expected_error_message}).encode("utf-8")
        mock_method.return_value = mock_return
    return ErrorData(expected_error_message, code)


@pytest.fixture
def assert_token_in_headers(validate_response) -> Callable[[Response], str]:
    def wrapper(response: Response) -> str:
        validate_response(response)
        header_token = response.headers["Authorization"]
        assert len(header_token) > 0
        assert type(header_token) == str
        return header_token

    return wrapper


@pytest.fixture
def create_pool_creation_data_json():
    def wrapper(*uris: str):
        return PoolCreationData(
            spotify_uris=[PoolContent(spotify_uri=uri) for uri in uris]
        ).model_dump()

    return wrapper


@pytest.fixture
def existing_pool(request, create_mock_track_search_result, build_success_response, requests_client_get_queue,
                  create_pool_creation_data_json, test_client, validate_response, valid_token_header,
                  db_connection, logged_in_user_id) -> list[PoolMember]:
    track_amount = request.param if hasattr(request, "param") else random.randint(10, 20)
    tracks = [create_mock_track_search_result() for _ in range(track_amount)]
    responses = [build_success_response(track) for track in tracks]
    requests_client_get_queue.extend(responses)
    data_json = create_pool_creation_data_json(*[track["uri"] for track in tracks])

    test_client.post("/pool", json=data_json, headers=valid_token_header)
    with db_connection.session() as session:
        members = session.scalars(select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    return members


@pytest.fixture
def requests_client_with_auth_mock(requests_client_post_queue, requests_client_get_queue, default_token_return,
                                   default_me_return):
    requests_client_post_queue.append(default_token_return)
    requests_client_get_queue.append(default_me_return)
    return default_token_return.content


class MockDateTimeWrapper(DateTimeWrapperRaw):

    def __init__(self):
        super().__init__()
        self._add_to_now: datetime.timedelta = datetime.timedelta(milliseconds=0)

    @override
    def now(self) -> datetime.datetime:
        return datetime.datetime.now(tz=self._timezone) + self._add_to_now

    def increment_now(self, delta: datetime.timedelta):
        self._add_to_now += delta


@pytest.fixture
def mock_datetime_wrapper() -> MockDateTimeWrapper:
    return MockDateTimeWrapper()


@pytest.fixture
def increment_now(mock_datetime_wrapper) -> Callable[[datetime.timedelta], None]:
    def wrapper(increment: datetime.timedelta):
        mock_datetime_wrapper.increment_now(increment)

    return wrapper


# "Borrowed" from here: https://github.com/pytest-dev/pytest/issues/8395
class ApproxDatetime(ApproxBase):

    def __init__(self, expected, abs: datetime.timedelta = datetime.timedelta(milliseconds=100)):
        if abs < datetime.timedelta(0):
            raise ValueError(f"absolute tolerance can't be negative: {abs}")
        super().__init__(expected, abs=abs)

    def __repr__(self):
        return f"approx_datetime({self.expected!r} \u00b1 {self.abs!r})"

    def __eq__(self, actual):
        return abs(self.expected - actual) <= self.abs


@pytest.fixture
def approx_datetime():
    return ApproxDatetime
