import datetime
import json
import random
import re
from pathlib import Path
from typing import Any, Optional
from unittest.mock import Mock

import httpx
import pytest
from _pytest.config import Config
from _pytest.fixtures import FixtureRequest
from _pytest.monkeypatch import MonkeyPatch
from faker import Faker
from fastapi import FastAPI
from helpers.classes import ErrorData, ErrorResponse, MockDateTimeWrapper, MockedArtistPoolContent, MockedPoolContents
from pydantic import BaseModel
from sqlalchemy import select
from starlette.responses import Response
from starlette.testclient import TestClient
from test_types.aliases import MockResponseQueue, SpotifySecrets
from test_types.callables import (
    AssertTokenInHeaders,
    BuildSuccessResponse,
    CreateHeaderFromTokenResponse,
    CreatePool,
    CreatePoolCreationDataJson,
    CreateToken,
    GetExistingPool,
    GetQueryParameter,
    IncrementNow,
    LogUserIn,
    MockAlbumFetch,
    MockAlbumSearchResult,
    MockArtistFetch,
    MockArtistSearchResult,
    MockPlaylistFetch,
    MockPlaylistFetchResult,
    MockPlaylistSearchResult,
    MockPoolContentFetches,
    MockTokenReturn,
    MockTrackFetch,
    MockTrackSearchResult,
    ValidateErrorResponse,
    ValidateModel,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers, PoolContentData, PoolCreationDataDict

from api.application import create_app
from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import (
    AuthSpotifyClient,
    DateTimeWrapperRaw,
    RequestsClient,
    RequestsClientRaw,
    SpotifyClient,
    TokenHolder,
    UserDatabaseConnection,
)
from api.common.models import ParsedTokenResponse
from api.common.spotify_models import AlbumData, ArtistData, PlaylistData, TrackData
from api.pool.models import PoolContent, PoolCreationData, PoolFullContents
from database.database_connection import ConnectionManager
from database.entities import PoolMember, User


@pytest.fixture
def application() -> FastAPI:
    return create_app()


@pytest.fixture
def requests_client() -> Mock:
    mock_response = Mock()
    mock_response.content = json.dumps({"default": "test_response"}).encode("utf-8")
    mock_response.status_code = 200
    mock_client = Mock()
    mock_client.put = Mock(return_value=mock_response)
    mock_client.post = Mock(return_value=mock_response)
    mock_client.get = Mock(return_value=mock_response)
    return mock_client


@pytest.fixture
def requests_client_get_queue(requests_client: RequestsClient) -> MockResponseQueue:
    queue = []
    requests_client.get = Mock(side_effect=queue)
    return queue


@pytest.fixture
def requests_client_post_queue(requests_client: RequestsClient) -> MockResponseQueue:
    queue = []
    requests_client.post = Mock(side_effect=queue)
    return queue


@pytest.fixture
def requests_client_put_queue(requests_client: RequestsClient) -> MockResponseQueue:
    queue = []
    requests_client.put = Mock(side_effect=queue)
    return queue


@pytest.fixture
def db_connection(tmp_path: Path, pytestconfig: Config, monkeypatch: MonkeyPatch) -> ConnectionManager:
    echo = "-v" in pytestconfig.invocation_params.args
    monkeypatch.setenv("DATABASE_CONNECTION_URL", f"sqlite:///{tmp_path}/test_db")
    monkeypatch.setenv("VERBOSE_SQLALCHEMY", str(echo))
    return ConnectionManager()


@pytest.fixture
def application_with_dependencies(
    application: FastAPI,
    requests_client: RequestsClientRaw,
    db_connection: ConnectionManager,
    mock_datetime_wrapper: MockDateTimeWrapper,
) -> FastAPI:
    application.dependency_overrides[RequestsClientRaw] = lambda: requests_client
    application.dependency_overrides[ConnectionManager] = lambda: db_connection
    application.dependency_overrides[DateTimeWrapperRaw] = lambda: mock_datetime_wrapper
    return application


@pytest.fixture
def test_client(application_with_dependencies: FastAPI) -> TestClient:
    return TestClient(application_with_dependencies)


@pytest.fixture
def validate_response() -> ValidateResponse:
    def wrapper(response: httpx.Response, code: int = 200) -> dict[str, Any]:
        assert response.status_code == code, f"Expected response with status code {code}, got {response.status_code}"
        return json.loads(response.content.decode("utf-8")) if response.content else None

    return wrapper


@pytest.fixture
def spotify_client(requests_client: RequestsClient) -> SpotifyClient:
    return SpotifyClient(requests_client)


@pytest.fixture
def auth_spotify_client(spotify_client: SpotifyClient) -> AuthSpotifyClient:
    return AuthSpotifyClient(spotify_client)


@pytest.fixture
def mock_token_holder(
    db_connection: ConnectionManager, auth_spotify_client: AuthSpotifyClient, mock_datetime_wrapper: MockDateTimeWrapper
) -> TokenHolder:
    user_database_connection = UserDatabaseConnection(db_connection, mock_datetime_wrapper)
    return TokenHolder(user_database_connection, auth_spotify_client, mock_datetime_wrapper, None)


@pytest.fixture
def create_token(faker: Faker) -> CreateToken:
    def wrapper() -> ParsedTokenResponse:
        token = faker.uuid4()
        return ParsedTokenResponse(token=f"Bearer {token}", refresh_token=f"Refresh {token}", expires_in=3600)

    return wrapper


@pytest.fixture
def primary_user_token(create_token: CreateToken) -> ParsedTokenResponse:
    return create_token()


@pytest.fixture
def logged_in_user(logged_in_user_id: str) -> User:
    return User(
        spotify_id=logged_in_user_id, spotify_username=logged_in_user_id, spotify_avatar_url="user.icon.example"
    )


@pytest.fixture
def auth_database_connection(
    db_connection: ConnectionManager, mock_datetime_wrapper: MockDateTimeWrapper
) -> AuthDatabaseConnection:
    return AuthDatabaseConnection(db_connection, mock_datetime_wrapper)


@pytest.fixture
def log_user_in(auth_database_connection: AuthDatabaseConnection) -> LogUserIn:
    def wrapper(user: User, token: ParsedTokenResponse) -> None:
        auth_database_connection.update_logged_in_user(user, token)

    return wrapper


@pytest.fixture
def create_header_from_token_response() -> CreateHeaderFromTokenResponse:
    def wrapper(token_response: ParsedTokenResponse) -> Headers:
        return {"Authorization": token_response.token}

    return wrapper


@pytest.fixture
def valid_token_header(
    log_user_in: LogUserIn,
    logged_in_user: User,
    primary_user_token: ParsedTokenResponse,
    create_header_from_token_response: CreateHeaderFromTokenResponse,
) -> Headers:
    log_user_in(logged_in_user, primary_user_token)
    return create_header_from_token_response(primary_user_token)


@pytest.fixture
def valid_token(log_user_in: LogUserIn, logged_in_user: User, primary_user_token: ParsedTokenResponse) -> str:
    log_user_in(logged_in_user, primary_user_token)
    return primary_user_token.token


@pytest.fixture
def logged_in_user_id(faker: Faker) -> str:
    user_id: str = faker.uuid4()
    return user_id


@pytest.fixture
def build_success_response() -> BuildSuccessResponse:
    def wrapper(data: dict[str, Any]) -> Mock:
        response = Mock()
        response.status_code = 200
        response.content = json.dumps(data).encode("utf-8")
        return response

    return wrapper


_DATE_PATTERN = "%Y-%m"


@pytest.fixture
def create_mock_artist_search_result(faker: Faker) -> MockArtistSearchResult:
    def wrapper() -> ArtistData:
        artist_name: str = faker.name()
        artist_id: str = faker.uuid4()
        return {
            "external_urls": {"spotify": f"https://artist.url.spotify.com/{artist_id}"},
            "followers": {"href": f"spotify:artist_followers:{artist_id}", "total": random.randint(1, 999_999_999)},
            "genres": ["Prog rock"],
            "href": f"https://spotify.api/resource:artist:{artist_id}",
            "id": artist_id,
            "images": [{"url": f"https://pic.spotify.url/{artist_name}", "height": 300, "width": 300}],
            "name": artist_name,
            "popularity": random.randint(1, 10),
            "type": "artist",
            "uri": f"spotify:artist:{artist_id}",
        }

    return wrapper


@pytest.fixture
def create_mock_album_search_result(faker: Faker) -> MockAlbumSearchResult:
    def wrapper(artist: ArtistData, tracks: list[dict[str, Any]] | None = None) -> AlbumData:
        album_name = faker.text(max_nb_chars=25)[:-1]
        album_id = faker.uuid4()
        album_release_date = faker.date(pattern=_DATE_PATTERN)
        album_data = {
            "album_type": "normal",
            "total_tracks": random.randint(4, 20),
            "available_markets": ["FI"],
            "external_urls": {"spotify": f"https://album.url.spotify.com/{album_id}"},
            "href": f"https://spotify.api/resource:album:{album_id}",
            "id": album_id,
            "images": [{"url": f"https://pic.spotify.url/{album_name}", "height": 300, "width": 300}],
            "name": album_name,
            "release_date": album_release_date,
            "release_date_precision": "year",
            "restrictions": {"reason": "market"},
            "type": "album",
            "uri": f"spotify:album:{album_id}",
            "artists": [
                {
                    "external_urls": artist["external_urls"],
                    "href": artist["href"],
                    "id": artist["id"],
                    "name": artist["name"],
                    "type": "artist",
                    "uri": artist["uri"],
                }
            ],
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
                "items": tracks,
            }
        return album_data

    return wrapper


@pytest.fixture
def create_mock_track_search_result(
    faker: Faker,
    create_mock_artist_search_result: MockArtistSearchResult,
    create_mock_album_search_result: MockAlbumSearchResult,
) -> MockTrackSearchResult:
    def wrapper(artist_in: ArtistData | None = None) -> TrackData:
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
            "external_ids": {"isrc": f"isrc:{track_id}", "ean": f"ean:{track_id}", "upc": f"upc:{track_id}"},
            "external_urls": {"spotify": f"https://track.url.spotify/{track_id}"},
            "href": f"https://spotify.api/resource:track:{track_id}",
            "id": track_id,
            "is_playable": True,
            "linked_from": {},
            "restrictions": {"reason": "market"},
            "name": track_name,
            "popularity": random.randint(1, 10),
            "preview_url": f"https://track.preview.spotify/{track_id}",
            "track_number": random.randint(1, album["total_tracks"]),
            "type": "track",
            "uri": f"spotify:track:{track_id}",
            "is_local": False,
        }

    return wrapper


@pytest.fixture
def create_mock_playlist_search_result(faker: Faker) -> MockPlaylistSearchResult:
    def wrapper(tracks: list[TrackData] | None = None) -> PlaylistData:
        playlist_id = faker.uuid4()
        playlist_name = faker.text(max_nb_chars=25)[:-1]
        playlist_owner = faker.name()
        playlist_owner_id = faker.uuid4()
        playlist_data = {
            "collaborative": random.choice((True, False)),
            "description": faker.paragraph(nb_sentences=2),
            "external_urls": {"spotify": f"https://playlist.url.spotify/{playlist_id}"},
            "href": f"https://spotify.api/resource:playlist:{playlist_id}",
            "id": playlist_id,
            "images": [{"url": f"https://pic.spotify.url/{playlist_name}", "height": 300, "width": 300}],
            "name": playlist_name,
            "owner": {
                "external_urls": {"spotify": f"https://user.url.spotify/{playlist_owner}"},
                "followers": {
                    "href": f"https://spotify.api/resource:followers:{playlist_owner_id}",
                    "total": random.randint(1, 999),
                },
                "href": f"https://spotify.api/resource:user:{playlist_owner_id}",
                "id": playlist_owner_id,
                "type": "user",
                "uri": f"spotify:user:{playlist_owner_id}",
                "display_name": playlist_owner,
            },
            "public": random.choice((True, False)),
            "snapshot_id": faker.uuid4(),
            "tracks": {
                "href": f"https://spotify.api/resource:playlist_tracks:{playlist_id}",
                "total": random.randint(1, 5000),
            },
            "type": "playlist",
            "uri": f"spotify:playlist:{playlist_id}",
        }
        if tracks is not None:
            playlist_data["tracks"] = {
                "href": f"{playlist_data['href']}/tracks?offset=0&limit=50",
                "limit": 50,
                "next": f"{playlist_data['href']}/tracks?offset=50&limit=50",
                "offset": 0,
                "previous": None,
                "total": len(tracks) + random.randint(1, 20),
                "items": tracks,
            }
        return playlist_data

    return wrapper


@pytest.fixture
def get_query_parameter() -> GetQueryParameter:
    restricted_characters = r"&"

    def wrapper(query_string: str, parameter_name: str) -> str:
        match = re.match(rf".*[&?]{parameter_name}=([^{restricted_characters}]+)(?:$|&.*)", query_string)
        assert match, f"Could not find query parameter {parameter_name} in query '{query_string}'"
        return match.group(1)

    return wrapper


@pytest.fixture(params=[401, 403, 404, 500])
def spotify_error_message(request: FixtureRequest, requests_client: RequestsClient) -> ErrorData:
    code = request.param
    expected_error_message = "my error message"
    for mock_method in (requests_client.get, requests_client.post, requests_client.put):
        mock_return = Mock()
        mock_return.status_code = code
        mock_return.content = json.dumps({"error": expected_error_message}).encode("utf-8")
        mock_method.return_value = mock_return
    return ErrorData(expected_error_message, code)


@pytest.fixture
def assert_token_in_headers(validate_response: ValidateResponse) -> AssertTokenInHeaders:
    def wrapper(response: Response) -> str:
        validate_response(response)
        header_token = response.headers["Authorization"]
        assert len(header_token) > 0
        assert isinstance(header_token, str)
        return header_token

    return wrapper


@pytest.fixture
def create_pool_creation_data_json() -> CreatePoolCreationDataJson:
    def wrapper(*uris: str) -> PoolCreationDataDict:
        return PoolCreationData(spotify_uris=[PoolContent(spotify_uri=uri) for uri in uris]).model_dump()

    return wrapper


@pytest.fixture
def mock_datetime_wrapper() -> MockDateTimeWrapper:
    return MockDateTimeWrapper()


@pytest.fixture
def increment_now(mock_datetime_wrapper: MockDateTimeWrapper) -> IncrementNow:
    def wrapper(increment: datetime.timedelta) -> None:
        mock_datetime_wrapper.increment_now(increment)

    return wrapper


@pytest.fixture
def mock_token_return() -> MockTokenReturn:
    def wrapper(
        token: str = "my access_token", expires_in: int = 800, refresh_token: str = "my refresh token"
    ) -> httpx.Response:
        return_json = {
            "access_token": token,
            "token_type": "Bearer",
            "scopes": "ignored here",
            "expires_in": expires_in,
            "refresh_token": refresh_token,
        }
        response = Mock()
        response.status_code = 200
        response.content = json.dumps(return_json).encode("utf-8")
        return response

    return wrapper


@pytest.fixture
def correct_env_variables(monkeypatch: MonkeyPatch) -> SpotifySecrets:
    client_id = "my_client_id"
    client_secret = "my_client_secret"
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", client_id)
    monkeypatch.setenv("SPOTIFY_CLIENT_SECRET", client_secret)
    return client_id, client_secret


@pytest.fixture
def validate_model(validate_response: ValidateResponse) -> ValidateModel:
    def wrapper[T: type(BaseModel)](expected_type: T, response: httpx.Response) -> T:
        return expected_type.model_validate(validate_response(response))

    return wrapper


@pytest.fixture
def validate_error_response(validate_response: ValidateResponse) -> ValidateErrorResponse:
    def wrapper(response: httpx.Response, code: int, message: str) -> None:
        exception = ErrorResponse.model_validate(validate_response(response, code))
        assert message == exception.detail

    return wrapper


@pytest.fixture
def mock_track_fetch(
    create_mock_track_search_result: MockTrackSearchResult,
    requests_client_get_queue: MockResponseQueue,
    mocked_pool_contents: MockedPoolContents,
    build_success_response: BuildSuccessResponse,
) -> MockTrackFetch:
    def wrapper(artist_in: ArtistData = None) -> PoolContentData:
        track = create_mock_track_search_result(artist_in)
        mocked_pool_contents.tracks.append(track)
        requests_client_get_queue.append(build_success_response(track))
        return PoolContent(spotify_uri=track["uri"]).model_dump()

    return wrapper


@pytest.fixture
def mock_artist_fetch(
    create_mock_artist_search_result: MockArtistSearchResult,
    create_mock_track_search_result: MockTrackSearchResult,
    requests_client_get_queue: MockResponseQueue,
    mocked_pool_contents: MockedPoolContents,
    build_success_response: BuildSuccessResponse,
) -> MockArtistFetch:
    def wrapper() -> PoolContentData:
        artist = create_mock_artist_search_result()
        tracks = {"tracks": [create_mock_track_search_result(artist) for _ in range(10)]}
        mocked_pool_contents.artists.append(MockedArtistPoolContent(artist=artist, tracks=tracks["tracks"]))
        requests_client_get_queue.extend([build_success_response(artist), build_success_response(tracks)])
        return PoolContent(spotify_uri=artist["uri"]).model_dump()

    return wrapper


@pytest.fixture
def mock_album_fetch(
    create_mock_album_search_result: MockAlbumSearchResult,
    create_mock_artist_search_result: MockArtistSearchResult,
    create_mock_track_search_result: MockTrackSearchResult,
    requests_client_get_queue: MockResponseQueue,
    mocked_pool_contents: MockedPoolContents,
    build_success_response: BuildSuccessResponse,
) -> MockAlbumFetch:
    def wrapper(album_length: int = 12) -> PoolContentData:
        artist = create_mock_artist_search_result()
        tracks = [create_mock_track_search_result(artist) for _ in range(album_length)]
        album = create_mock_album_search_result(artist, tracks)
        mocked_pool_contents.albums.append(album)
        requests_client_get_queue.append(build_success_response(album))
        return PoolContent(spotify_uri=album["uri"]).model_dump()

    return wrapper


@pytest.fixture
def mock_playlist_fetch(
    create_mock_playlist_fetch_result: MockPlaylistFetchResult,
    requests_client_get_queue: MockResponseQueue,
    mocked_pool_contents: MockedPoolContents,
    build_success_response: BuildSuccessResponse,
) -> MockPlaylistFetch:
    def wrapper(playlist_length: int = 30, *, append_none: bool = False) -> PoolContentData:
        playlist_fetch_data = create_mock_playlist_fetch_result(playlist_length, append_none=append_none)
        requests_client_get_queue.append(build_success_response(playlist_fetch_data.first_fetch))
        for further_fetch in playlist_fetch_data.further_fetches:
            requests_client_get_queue.append(build_success_response(further_fetch))
        mocked_pool_contents.playlists.append(playlist_fetch_data)
        return PoolContent(spotify_uri=playlist_fetch_data.first_fetch["uri"]).model_dump()

    return wrapper


@pytest.fixture
def mocked_pool_contents() -> MockedPoolContents:
    return MockedPoolContents()


@pytest.fixture
def get_existing_pool(
    validate_model: ValidateModel, test_client: TestClient, valid_token_header: Headers
) -> GetExistingPool:
    def wrapper() -> type[PoolFullContents]:
        return validate_model(PoolFullContents, test_client.get("/pool", headers=valid_token_header))

    return wrapper


@pytest.fixture
def mock_pool_content_fetches(
    mock_track_fetch: MockTrackFetch,
    mock_artist_fetch: MockArtistFetch,
    mock_album_fetch: MockAlbumFetch,
    mock_playlist_fetch: MockPlaylistFetch,
) -> MockPoolContentFetches:
    def wrapper(
        tracks: int = 0, artists: int = 0, albums: Optional[list[int]] = None, playlists: Optional[list[int]] = None
    ) -> PoolCreationDataDict:
        content_models: list[PoolContentData] = []
        content_models.extend([mock_track_fetch() for _ in range(tracks)])
        content_models.extend([mock_artist_fetch() for _ in range(artists)])
        content_models.extend([mock_album_fetch(length) for length in (albums if albums is not None else [])])
        content_models.extend([mock_playlist_fetch(length) for length in (playlists if playlists is not None else [])])
        return PoolCreationData(spotify_uris=content_models).model_dump()

    return wrapper


@pytest.fixture
def create_pool(
    mock_pool_content_fetches: MockPoolContentFetches, test_client: TestClient, valid_token_header: Headers
) -> CreatePool:
    def wrapper(
        tracks: int = 0, artists: int = 0, albums: Optional[list[int]] = None, playlists: Optional[list[int]] = None
    ) -> httpx.Response:
        data_json = mock_pool_content_fetches(tracks, artists, albums, playlists)
        return test_client.post("/pool", json=data_json, headers=valid_token_header)

    return wrapper


@pytest.fixture
def existing_pool(
    create_pool: CreatePool, db_connection: ConnectionManager, logged_in_user_id: str
) -> list[PoolMember]:
    create_pool(tracks=15)
    with db_connection.session() as session:
        members: list[PoolMember] = (
            session.scalars(select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
        )
    return members
