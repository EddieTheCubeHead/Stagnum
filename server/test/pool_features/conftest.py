import datetime
import random
from typing import Callable, Coroutine
from unittest.mock import Mock

import pytest
from starlette.responses import Response
from starlette.testclient import TestClient

from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import RequestsClient, SpotifyClientRaw
from api.common.models import ParsedTokenResponse
from api.pool import queue_next_songs
from api.pool.dependencies import PoolDatabaseConnectionRaw, PoolSpotifyClientRaw, PoolPlaybackServiceRaw, \
    PlaybackWebsocketUpdaterRaw
from api.pool.models import PoolCreationData, PoolContent
from api.pool.randomization_algorithms import NextSongProvider, RandomizationParameters
from database.database_connection import ConnectionManager
from database.entities import User


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
                      test_client: TestClient, valid_token_header, fixed_track_length_ms, request):
    track_amount = request.param if hasattr(request, "param") else random.randint(10, 20)
    tracks = [create_mock_track_search_result() for _ in range(track_amount)]
    for track in tracks:
        track["duration_ms"] = fixed_track_length_ms
    responses = [build_success_response(track) for track in tracks]
    requests_client.get = Mock(side_effect=responses)
    track_uris = [track["uri"] for track in tracks]
    data_json = create_pool_creation_data_json(*track_uris)
    test_client.post("/pool", json=data_json, headers=valid_token_header)
    return tracks


@pytest.fixture
def another_logged_in_user_header(another_logged_in_user_token):
    return {"Authorization": another_logged_in_user_token}


@pytest.fixture
def another_logged_in_user_token(faker, db_connection):
    authorization_database_connection = AuthDatabaseConnection(db_connection)
    user_id = faker.uuid4()
    user = User(spotify_id=user_id, spotify_username=user_id, spotify_avatar_url=f"user.icon.example")
    token_data = ParsedTokenResponse(token="my test token 2", refresh_token="my refresh token 2", expires_in=999999)
    authorization_database_connection.update_logged_in_user(user, token_data)
    return token_data.token



@pytest.fixture
def share_pool_and_get_code(test_client, valid_token_header, validate_response) -> Callable[[], str]:
    def wrapper() -> str:
        response = test_client.post("/pool/share", headers=valid_token_header)
        result = validate_response(response)
        return result["share_code"]

    return wrapper


@pytest.fixture
def pool_db_connection(db_connection: ConnectionManager):
    return PoolDatabaseConnectionRaw(db_connection)


@pytest.fixture
def pool_spotify_client(requests_client: RequestsClient):
    return PoolSpotifyClientRaw(SpotifyClientRaw(requests_client))


@pytest.fixture
def playback_updater():
    return PlaybackWebsocketUpdaterRaw()


@pytest.fixture
def playback_service(pool_db_connection, pool_spotify_client, mock_token_holder, next_song_provider, playback_updater):
    return PoolPlaybackServiceRaw(pool_db_connection, pool_spotify_client, mock_token_holder, next_song_provider,
                                  playback_updater)


@pytest.fixture
def shared_pool_code(existing_playback, share_pool_and_get_code) -> str:
    return share_pool_and_get_code()


@pytest.fixture
def next_song_provider():
    return NextSongProvider()


@pytest.fixture
def weighted_parameters(monkeypatch) -> RandomizationParameters:
    parameters = RandomizationParameters(5, 20, 60, 90)
    monkeypatch.setenv("CUSTOM_WEIGHT_SCALE", str(parameters.custom_weight_scale))
    monkeypatch.setenv("USER_WEIGHT_SCALE", str(parameters.custom_weight_scale))
    monkeypatch.setenv("PSEUDO_RANDOM_FLOOR", str(parameters.pseudo_random_floor))
    monkeypatch.setenv("PSEUDO_RANDOM_CEILING", str(parameters.pseudo_random_ceiling))
    return parameters


@pytest.fixture
def build_empty_queue(create_mock_track_search_result) -> Callable[[], dict]:
    def wrapper():
        currently_playing = create_mock_track_search_result()
        return {
            "currently_playing": currently_playing,
            "queue": [],
        }

    return wrapper


@pytest.fixture
def mock_empty_queue_get(requests_client, build_success_response, build_empty_queue) -> Callable[[], dict]:
    def wrapper():
        queue_data = build_empty_queue()
        requests_client.get = Mock(return_value=build_success_response(queue_data))
        return queue_data

    return wrapper


@pytest.fixture
def empty_queue(mock_empty_queue_get) -> dict:
    return mock_empty_queue_get()


@pytest.fixture
def build_queue_with_song(create_mock_track_search_result) -> Callable[[], dict]:
    def wrapper():
        currently_playing = create_mock_track_search_result()
        next_song = create_mock_track_search_result()
        return {
            "currently_playing": currently_playing,
            "queue": [next_song],
        }

    return wrapper


@pytest.fixture
def mock_filled_queue_get(requests_client, build_success_response, build_queue_with_song) -> Callable[[], dict]:
    def wrapper():
        queue_data = build_queue_with_song()
        requests_client.get = Mock(return_value=build_success_response(queue_data))
        return queue_data

    return wrapper


@pytest.fixture
def song_in_queue(mock_filled_queue_get) -> dict:
    return mock_filled_queue_get()


@pytest.fixture
def run_scheduling_job(playback_service, mock_empty_queue_get) -> Callable[[], Coroutine[None, None, None]]:
    async def wrapper():
        mock_empty_queue_get()
        await queue_next_songs(playback_service)

    return wrapper


@pytest.fixture
def skip_song(test_client, mock_empty_queue_get) -> Callable[[dict], Response]:
    def wrapper(headers: dict):
        mock_empty_queue_get()
        return test_client.post("/pool/playback/skip", headers=headers)

    return wrapper


@pytest.fixture
def create_spotify_playback_state(faker, fixed_track_length_ms,
                                  create_mock_track_search_result) -> Callable[[int | None, bool | None], dict]:
    def wrapper(playback_left: int = 1000, is_playing: bool = True) -> dict:
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
            "context": None,
            "timestamp": datetime.datetime.now().timestamp(),
            "progress_ms": fixed_track_length_ms - playback_left,
            "is_playing": is_playing,
            "item": create_mock_track_search_result(),
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


@pytest.fixture
def skippable_spotify_playback(requests_client, create_spotify_playback_state, build_success_response):
    playback_state = create_spotify_playback_state()
    requests_client.get = Mock(return_value=build_success_response(playback_state))


@pytest.fixture
def unskippable_spotify_playback(requests_client, create_spotify_playback_state, build_success_response):
    playback_state = create_spotify_playback_state(5000)
    requests_client.get = Mock(return_value=build_success_response(playback_state))
