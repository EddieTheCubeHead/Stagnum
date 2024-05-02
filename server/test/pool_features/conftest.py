import datetime
import json
import random
from dataclasses import dataclass
from typing import Callable, Any, Protocol, Awaitable
from unittest.mock import Mock

import httpx
import pytest
from _pytest.fixtures import FixtureRequest
from _pytest.monkeypatch import MonkeyPatch
from faker import Faker
from starlette.responses import Response
from starlette.testclient import TestClient

from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import RequestsClient, SpotifyClientRaw, TokenHolderRaw
from api.common.models import ParsedTokenResponse
from api.pool import queue_next_songs
from api.pool.dependencies import PoolDatabaseConnectionRaw, PoolSpotifyClientRaw, PoolPlaybackServiceRaw, \
    WebsocketUpdaterRaw
from api.pool.randomization_algorithms import NextSongProvider, RandomizationParameters
from conftest import mock_track_search_result_callable, build_success_response_callable, \
    create_pool_creation_data_json_callable, validate_response_callable, MockDateTimeWrapper
from database.database_connection import ConnectionManager
from database.entities import User


@dataclass
class CurrentPlaybackData:
    current_track: dict | None = None


@pytest.fixture
def current_playback_data() -> CurrentPlaybackData:
    return CurrentPlaybackData()


class _MockPlaylistFetchResultProtocol(Protocol):
    def __call__(self, track_amount: int, append_none: bool = ...) -> dict[str, Any] | ([dict[str, Any]], ...):
        ...


mock_playlist_fetch_result_callable = _MockPlaylistFetchResultProtocol


@pytest.fixture
def create_mock_playlist_fetch_result(create_mock_track_search_result: mock_track_search_result_callable,
                                      faker: Faker) -> mock_playlist_fetch_result_callable:
    def wrapper(track_amount: int, append_none: bool = False) -> dict[str, Any] | ([dict[str, Any]], ...):
        user = faker.name().replace(" ", "")
        playlist_id = faker.uuid4()
        tracks: list[dict[str, Any] | None] = [create_mock_track_search_result() for _ in range(track_amount)]
        if append_none:
            tracks.append(None)
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
def fixed_track_length_ms(minutes: int = 3, seconds: int = 30) -> int:
    return (minutes * 60 + seconds) * 1000


@pytest.fixture
def existing_playback(db_connection: ConnectionManager,
                      create_mock_track_search_result: mock_track_search_result_callable,
                      build_success_response: build_success_response_callable,
                      requests_client_get_queue: list[httpx.Response],
                      create_pool_creation_data_json: create_pool_creation_data_json_callable,
                      test_client: TestClient, valid_token_header: dict[str, str], fixed_track_length_ms: int,
                      request: FixtureRequest, current_playback_data: CurrentPlaybackData,
                      validate_response: validate_response_callable) -> list[dict[str, Any]]:
    track_amount = request.param if hasattr(request, "param") else random.randint(10, 20)
    tracks = [create_mock_track_search_result() for _ in range(track_amount)]
    for track in tracks:
        track["duration_ms"] = fixed_track_length_ms
    responses = [build_success_response(track) for track in tracks]
    requests_client_get_queue.extend(responses)
    track_uris = [track["uri"] for track in tracks]
    data_json = create_pool_creation_data_json(*track_uris)
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    currently_playing = validate_response(response)["currently_playing"]
    for track in tracks:
        if track["uri"] == currently_playing["spotify_track_uri"]:
            current_playback_data.current_track = track
    return tracks


@pytest.fixture
def another_logged_in_user_header(another_logged_in_user_token: str) -> dict[str, str]:
    return {"Authorization": another_logged_in_user_token}


@pytest.fixture
def another_logged_in_user(faker: Faker) -> User:
    user_id = faker.uuid4()
    return User(spotify_id=user_id, spotify_username=user_id, spotify_avatar_url=f"user.icon.example")


@pytest.fixture
def another_logged_in_user_token(another_logged_in_user: User, db_connection: ConnectionManager,
                                 mock_datetime_wrapper: MockDateTimeWrapper) -> str:
    authorization_database_connection = AuthDatabaseConnection(db_connection, mock_datetime_wrapper)
    token_data = ParsedTokenResponse(token="my test token 2", refresh_token="my refresh token 2", expires_in=999999)
    authorization_database_connection.update_logged_in_user(another_logged_in_user, token_data)
    return token_data.token


share_pool_and_get_code_callable = Callable[[], str]


@pytest.fixture
def share_pool_and_get_code(test_client: TestClient, valid_token_header: dict[str, str],
                            validate_response: validate_response_callable) -> share_pool_and_get_code_callable:
    def wrapper() -> str:
        response = test_client.post("/pool/share", headers=valid_token_header)
        result = validate_response(response)
        return result["share_code"]

    return wrapper


@pytest.fixture
def pool_db_connection(db_connection: ConnectionManager,
                       mock_datetime_wrapper: MockDateTimeWrapper) -> PoolDatabaseConnectionRaw:
    return PoolDatabaseConnectionRaw(db_connection, mock_datetime_wrapper)


@pytest.fixture
def pool_spotify_client(requests_client: RequestsClient) -> PoolSpotifyClientRaw:
    return PoolSpotifyClientRaw(SpotifyClientRaw(requests_client))


@pytest.fixture
def playback_updater() -> WebsocketUpdaterRaw:
    return WebsocketUpdaterRaw()


@pytest.fixture
def playback_service(pool_db_connection: PoolDatabaseConnectionRaw, pool_spotify_client: PoolSpotifyClientRaw,
                     mock_token_holder: TokenHolderRaw, next_song_provider: NextSongProvider,
                     playback_updater: WebsocketUpdaterRaw,
                     mock_datetime_wrapper: MockDateTimeWrapper) -> PoolPlaybackServiceRaw:
    return PoolPlaybackServiceRaw(pool_db_connection, pool_spotify_client, mock_token_holder, next_song_provider,
                                  mock_datetime_wrapper, playback_updater)


@pytest.fixture
def shared_pool_code(existing_playback: list[dict[str, Any]],
                     share_pool_and_get_code: share_pool_and_get_code_callable) -> str:
    return share_pool_and_get_code()


@pytest.fixture
def next_song_provider() -> NextSongProvider:
    return NextSongProvider()


@pytest.fixture
def weighted_parameters(monkeypatch: MonkeyPatch) -> RandomizationParameters:
    parameters = RandomizationParameters(5, 20, 60, 90)
    monkeypatch.setenv("CUSTOM_WEIGHT_SCALE", str(parameters.custom_weight_scale))
    monkeypatch.setenv("USER_WEIGHT_SCALE", str(parameters.custom_weight_scale))
    monkeypatch.setenv("PSEUDO_RANDOM_FLOOR", str(parameters.pseudo_random_floor))
    monkeypatch.setenv("PSEUDO_RANDOM_CEILING", str(parameters.pseudo_random_ceiling))
    return parameters


build_empty_queue_callable = Callable[[], dict[str, Any]]


@pytest.fixture
def build_empty_queue(create_mock_track_search_result: mock_track_search_result_callable,
                      current_playback_data: CurrentPlaybackData) -> build_empty_queue_callable:
    def wrapper() -> dict[str, Any]:
        currently_playing = create_mock_track_search_result()
        queue_tail = [current_playback_data.current_track] * 50
        return {
            "currently_playing": currently_playing,
            "queue": queue_tail,
        }

    return wrapper


mock_empty_queue_get_callable = Callable[[], dict[str, Any]]


@pytest.fixture
def mock_empty_queue_get(requests_client_get_queue: list[httpx.Response],
                         build_success_response: build_success_response_callable,
                         build_empty_queue: build_empty_queue_callable) -> mock_empty_queue_get_callable:
    def wrapper() -> dict[str, Any]:
        queue_data = build_empty_queue()
        requests_client_get_queue.append(build_success_response(queue_data))
        return queue_data

    return wrapper


@pytest.fixture
def empty_queue(mock_empty_queue_get: mock_empty_queue_get_callable) -> dict:
    return mock_empty_queue_get()


build_queue_with_song_callable = Callable[[], dict[str, Any]]


@pytest.fixture
def build_queue_with_song(create_mock_track_search_result: mock_track_search_result_callable,
                          current_playback_data: CurrentPlaybackData) -> build_queue_with_song_callable:
    def wrapper() -> dict[str, Any]:
        currently_playing = create_mock_track_search_result()
        next_song = create_mock_track_search_result()
        queue_tail = [current_playback_data.current_track] * 50
        return {
            "currently_playing": currently_playing,
            "queue": [next_song] + queue_tail,
        }

    return wrapper


mock_filled_queue_get_callable = Callable[[], dict[str, Any]]


@pytest.fixture
def mock_filled_queue_get(requests_client_get_queue: list[httpx.Response],
                          build_success_response: build_success_response_callable,
                          build_queue_with_song: build_queue_with_song_callable) -> mock_filled_queue_get_callable:
    def wrapper() -> dict[str, Any]:
        queue_data = build_queue_with_song()
        requests_client_get_queue.append(build_success_response(queue_data))
        return queue_data

    return wrapper


@pytest.fixture
def song_in_queue(mock_filled_queue_get: mock_filled_queue_get_callable,
                  mock_empty_queue_get: mock_empty_queue_get_callable) -> dict:
    queue_data = mock_filled_queue_get()
    mock_empty_queue_get()
    return queue_data


class _CreateSpotifyPlaybackStateProtocol(Protocol):
    def __call__(self, song_data: dict[str, Any], playback_left: int = ..., is_playing: bool = ...,
                 context: dict | None = ...) -> dict[str, Any]:
        ...


create_spotify_playback_state_callable = _CreateSpotifyPlaybackStateProtocol


@pytest.fixture
def create_spotify_playback_state(faker: Faker, create_mock_track_search_result: mock_track_search_result_callable,
                                  mock_datetime_wrapper: MockDateTimeWrapper) -> create_spotify_playback_state_callable:
    def wrapper(song_data: dict[str, Any], playback_left: int = 1000, is_playing: bool = True,
                context: dict = None) -> dict[str, Any]:
        return {
            "device": {
                "id": faker.uuid4(),
                "is_active": True,
                "is_private_session": False,
                "is_restricted": False,
                "name": "my pc",
                "volume_percent": random.randint(1, 100),
                "supports_volume": False
            },
            "repeat_state": "track",
            "shuffle_state": False,
            "context": context,
            "timestamp": mock_datetime_wrapper.now().timestamp() * 1000,  # Spotify sends timestamps in milliseconds
            "progress_ms": song_data["duration_ms"] - playback_left,
            "is_playing": is_playing,
            "item": song_data,
            "currently_playing_type": "track",
            "actions": {
                "interrupting_playback": True,
                "pausing": True,
                "resuming": True,
                "seeking": True,
                "skipping_next": True,
                "skipping_prev": True,
                "toggling_repeat_context": True,
                "toggling_shuffle": True,
                "toggling_repeat_track": True,
                "transferring_playback": True
            }
        }

    return wrapper


class _CreateSpotifyPlaybackProtocol(Protocol):
    def __call__(self, playback_left_ms: int = ..., songs_in_queue: int = ..., song_data: dict | None = ...,
                 context: dict | None = ...) -> datetime.datetime:
        ...


create_spotify_playback_callable = _CreateSpotifyPlaybackProtocol


@pytest.fixture
def create_spotify_playback(requests_client_get_queue: list[httpx.Response],
                            create_spotify_playback_state: create_spotify_playback_state_callable,
                            build_success_response: build_success_response_callable,
                            create_mock_track_search_result: mock_track_search_result_callable,
                            current_playback_data: CurrentPlaybackData, mock_datetime_wrapper: MockDateTimeWrapper) \
        -> create_spotify_playback_callable:
    def wrapper(playback_left_ms: int = 500, songs_in_queue: int = 0, song_data: dict = None, context: dict = None) \
            -> datetime.datetime:
        song_data = song_data if song_data is not None else current_playback_data.current_track
        playback_state = create_spotify_playback_state(song_data, playback_left_ms, True, context)
        song_end_timestamp = mock_datetime_wrapper.now() + datetime.timedelta(milliseconds=playback_left_ms)
        requests_client_get_queue.append(build_success_response(playback_state))
        if songs_in_queue is not None:
            next_songs = [create_mock_track_search_result() for _ in range(songs_in_queue)]
            queue_tail = [current_playback_data.current_track] * 50
            queue_data = {
                "currently_playing": song_data,
                "queue": next_songs + queue_tail,
            }
            requests_client_get_queue.append(build_success_response(queue_data))
        return song_end_timestamp

    return wrapper


run_scheduling_job_awaitable = Callable[[], Awaitable[None]]


@pytest.fixture
def run_scheduling_job(playback_service: PoolPlaybackServiceRaw,
                       create_spotify_playback: create_spotify_playback_callable) -> run_scheduling_job_awaitable:
    async def wrapper() -> None:
        create_spotify_playback()
        await queue_next_songs(playback_service)

    return wrapper


skip_song_callable = Callable[[dict], httpx.Response]


@pytest.fixture
def skip_song(test_client: TestClient, create_spotify_playback: create_spotify_playback_callable) -> skip_song_callable:
    def wrapper(headers: dict) -> httpx.Response:
        create_spotify_playback(50000, 0)
        return test_client.post("/pool/playback/skip", headers=headers)

    return wrapper


mock_no_player_state_response_callable = Callable[[], None]


@pytest.fixture
def mock_no_player_playback_state_response(requests_client_get_queue: list[httpx.Response]) \
        -> mock_no_player_state_response_callable:
    def wrapper() -> None:
        response = Mock()
        response.status_code = 204
        response.content = json.dumps("").encode("utf-8")
        requests_client_get_queue.append(response)

    return wrapper


mock_playback_paused_response_callable = Callable[[], None]


@pytest.fixture
def mock_playback_paused_response(requests_client_get_queue: list[httpx.Response],
                                  create_spotify_playback_state: create_spotify_playback_state_callable,
                                  current_playback_data: CurrentPlaybackData,
                                  mock_empty_queue_get: mock_empty_queue_get_callable) \
        -> mock_playback_paused_response_callable:
    def wrapper() -> None:
        response = Mock()
        response.status_code = 204
        response_data = create_spotify_playback_state(current_playback_data.current_track, 5000, False)
        response.content = json.dumps(response_data).encode("utf-8")
        requests_client_get_queue.append(response)
        mock_empty_queue_get()

    return wrapper
