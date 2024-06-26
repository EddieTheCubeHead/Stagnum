import datetime
import json
import random
from unittest.mock import Mock

import httpx
import pytest
from _pytest.monkeypatch import MonkeyPatch
from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import RequestsClient, SpotifyClientRaw, TokenHolderRaw
from api.common.models import ParsedTokenResponse
from api.common.spotify_models import PaginatedSearchResultData, PlaylistTrackData, TrackData
from api.pool import queue_next_songs
from api.pool.dependencies import (
    PoolDatabaseConnectionRaw,
    PoolPlaybackServiceRaw,
    PoolSpotifyClientRaw,
    WebsocketUpdaterRaw,
)
from api.pool.randomization_algorithms import NextSongProvider, RandomizationParameters
from api.pool.spotify_models import PlaybackContextData, PlaybackStateData, QueueData
from database.database_connection import ConnectionManager
from database.entities import EntityBase, User
from faker import Faker
from helpers.classes import CurrentPlaybackData, MockDateTimeWrapper, MockedPlaylistPoolContent
from sqlalchemy import select
from starlette.testclient import TestClient
from test_types.aliases import MockResponseQueue
from test_types.callables import (
    AssertEmptyTables,
    BuildQueue,
    BuildSuccessResponse,
    CreatePlayback,
    CreatePoolCreationDataJson,
    CreateSpotifyPlayback,
    CreateSpotifyPlaybackState,
    MockNoPlayerStateResponse,
    MockPlaybackPausedResponse,
    MockPlaylistFetchResult,
    MockTrackSearchResult,
    RunSchedulingJob,
    SharePoolAndGetCode,
    SkipSong,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers


@pytest.fixture
def current_playback_data() -> CurrentPlaybackData:
    return CurrentPlaybackData()


@pytest.fixture
def create_mock_playlist_fetch_result(
    create_mock_track_search_result: MockTrackSearchResult, faker: Faker, mock_datetime_wrapper: MockDateTimeWrapper
) -> MockPlaylistFetchResult:
    def wrapper(track_amount: int, *, append_none: bool = False) -> MockedPlaylistPoolContent:
        user = faker.name().replace(" ", "")
        playlist_id = faker.uuid4()
        tracks: list[TrackData | None] = [create_mock_track_search_result() for _ in range(track_amount)]
        if append_none:
            tracks.append(None)
        playlist_tracks: list[PlaylistTrackData] = []
        for track in tracks:
            playlist_tracks.append({  # noqa: PERF401 - type checking goes haywire with list comprehension here
                "added_at": datetime.datetime.strftime(mock_datetime_wrapper.now(), "%Y-%m-%dT%H:%M:%SZ"),
                "added_by": {
                    "external_urls": {"spotify": f"https://fake.spotify.com/users/{user}"},
                    "href": f"https://api.spotify.fake/v1/users/{user}",
                    "id": user,
                    "type": "user",
                    "uri": f"spotify:user:{user}",
                },
                "is_local": False,
                "track": track,
            })
        batch = 100
        playlist_data = {
            "collaborative": False,
            "description": faker.paragraph(),
            "external_urls": {"spotify": f"https://fake.spotify.fake/playlist/{playlist_id}"},
            "followers": {"href": None, "total": random.randint(0, 9999)},
            "href": f"https://api.spotify.fake/v1/playlists/{playlist_id}?locale=en",
            "id": playlist_id,
            "images": [
                {"url": f"https://image-cdn-fa.spotifycdn.fake/image/{faker.uuid4()}", "height": None, "width": None}
            ],
            "name": faker.text(max_nb_chars=25)[:-1],
            "owner": {
                "external_urls": {"spotify": f"https://fake.spotify.com/users/{user}"},
                "href": f"https://api.spotify.fake/v1/users/{user}",
                "id": user,
                "type": "user",
                "uri": f"spotify:user:{user}",
                "display_name": user,
            },
            "public": True,
            "snapshot_id": faker.uuid4(),
            "tracks": {
                "href": f"https://api.spotify.fake/v1/playlists/{playlist_id}/tracks?offset=0&limit={batch}&locale=en",
                "limit": batch,
                "next": None
                if track_amount < batch
                else f"https://api.spotify.fake/v1/playlists/{playlist_id}/"
                f"tracks?offset={batch}&limit={batch}&locale=en",
                "offset": 0,
                "previous": None,
                "total": track_amount,
                "items": playlist_tracks[:batch],
            },
            "type": "playlist",
            "uri": f"spotify:playlist:{playlist_id}",
        }
        further_fetches: list[PaginatedSearchResultData] = []
        batch_walker = batch
        while batch_walker <= track_amount:
            next_batch_start = batch_walker + batch
            further_fetches.append({
                "href": f"https://api.spotify.fake/v1/playlists/{playlist_id}/tracks"
                f"?offset={batch_walker}&limit={batch}&locale=en",
                "limit": batch,
                "next": None
                if track_amount < batch_walker + batch
                else f"https://api.spotify.fake/v1/playlists/{playlist_id}/tracks"
                f"?offset={batch_walker + batch}&limit={batch}&locale=en",
                "offset": batch_walker,
                "previous": f"https://api.spotify.fake/v1/playlists/{playlist_id}/tracks"
                f"?offset={batch_walker - batch}&limit={batch}&locale=en",
                "total": track_amount,
                "items": playlist_tracks[batch_walker:next_batch_start],
            })
            batch_walker = next_batch_start
        return MockedPlaylistPoolContent(first_fetch=playlist_data, further_fetches=further_fetches)

    return wrapper


@pytest.fixture
def fixed_track_length_ms(minutes: int = 3, seconds: int = 30) -> int:
    return (minutes * 60 + seconds) * 1000


@pytest.fixture
def create_playback(
    create_mock_track_search_result: MockTrackSearchResult,
    build_success_response: BuildSuccessResponse,
    requests_client_get_queue: MockResponseQueue,
    create_pool_creation_data_json: CreatePoolCreationDataJson,
    test_client: TestClient,
    valid_token_header: Headers,
    fixed_track_length_ms: int,
    current_playback_data: CurrentPlaybackData,
    validate_response: ValidateResponse,
) -> CreatePlayback:
    def wrapper(track_amount: int = 15) -> list[TrackData]:
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
            if track["uri"] == currently_playing["spotify_resource_uri"]:
                current_playback_data.current_track = track
        return tracks

    return wrapper


@pytest.fixture
def existing_playback(create_playback: CreatePlayback) -> list[TrackData]:
    return create_playback()


@pytest.fixture
def another_logged_in_user_header(another_logged_in_user_token: str) -> Headers:
    return {"Authorization": another_logged_in_user_token}


@pytest.fixture
def another_logged_in_user(faker: Faker) -> User:
    user_id = faker.uuid4()
    return User(spotify_id=user_id, spotify_username=user_id, spotify_avatar_url="user.icon.example")


@pytest.fixture
def another_logged_in_user_token(
    another_logged_in_user: User, db_connection: ConnectionManager, mock_datetime_wrapper: MockDateTimeWrapper
) -> str:
    authorization_database_connection = AuthDatabaseConnection(db_connection, mock_datetime_wrapper)
    token_data = ParsedTokenResponse(token="my test token 2", refresh_token="my refresh token 2", expires_in=999999)
    authorization_database_connection.update_logged_in_user(another_logged_in_user, token_data)
    return token_data.token


@pytest.fixture
def joined_user_token(
    another_logged_in_user_token: str,
    joined_user_header: Headers,  # noqa: ARG001
) -> str:
    return another_logged_in_user_token


@pytest.fixture
def share_pool_and_get_code(
    test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse
) -> SharePoolAndGetCode:
    def wrapper() -> str:
        response = test_client.post("/pool/share", headers=valid_token_header)
        result = validate_response(response)
        return result["share_code"]

    return wrapper


@pytest.fixture
def pool_db_connection(
    db_connection: ConnectionManager, mock_datetime_wrapper: MockDateTimeWrapper
) -> PoolDatabaseConnectionRaw:
    return PoolDatabaseConnectionRaw(db_connection, mock_datetime_wrapper)


@pytest.fixture
def pool_spotify_client(requests_client: RequestsClient) -> PoolSpotifyClientRaw:
    return PoolSpotifyClientRaw(SpotifyClientRaw(requests_client))


@pytest.fixture
def playback_updater() -> WebsocketUpdaterRaw:
    return WebsocketUpdaterRaw()


@pytest.fixture
def playback_service(
    pool_db_connection: PoolDatabaseConnectionRaw,
    pool_spotify_client: PoolSpotifyClientRaw,
    mock_token_holder: TokenHolderRaw,
    next_song_provider: NextSongProvider,
    playback_updater: WebsocketUpdaterRaw,
    mock_datetime_wrapper: MockDateTimeWrapper,
) -> PoolPlaybackServiceRaw:
    return PoolPlaybackServiceRaw(
        pool_db_connection,
        pool_spotify_client,
        mock_token_holder,
        next_song_provider,
        mock_datetime_wrapper,
        playback_updater,
    )


@pytest.fixture
def shared_pool_code(
    existing_playback: list[TrackData],  # noqa: ARG001
    share_pool_and_get_code: SharePoolAndGetCode,
) -> str:
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


@pytest.fixture
def build_empty_queue(
    create_mock_track_search_result: MockTrackSearchResult, current_playback_data: CurrentPlaybackData
) -> BuildQueue:
    def wrapper() -> QueueData:
        currently_playing = create_mock_track_search_result()
        queue_tail = [current_playback_data.current_track] * 50
        return {"currently_playing": currently_playing, "queue": queue_tail}

    return wrapper


@pytest.fixture
def mock_empty_queue_get(
    requests_client_get_queue: MockResponseQueue,
    build_success_response: BuildSuccessResponse,
    build_empty_queue: BuildQueue,
) -> BuildQueue:
    def wrapper() -> QueueData:
        queue_data = build_empty_queue()
        requests_client_get_queue.append(build_success_response(queue_data))
        return queue_data

    return wrapper


@pytest.fixture
def empty_queue(mock_empty_queue_get: BuildQueue) -> QueueData:
    return mock_empty_queue_get()


@pytest.fixture
def build_queue_with_song(
    create_mock_track_search_result: MockTrackSearchResult, current_playback_data: CurrentPlaybackData
) -> BuildQueue:
    def wrapper() -> QueueData:
        currently_playing = create_mock_track_search_result()
        next_song = create_mock_track_search_result()
        queue_tail = [current_playback_data.current_track] * 50
        return {"currently_playing": currently_playing, "queue": [next_song, *queue_tail]}

    return wrapper


@pytest.fixture
def mock_filled_queue_get(
    requests_client_get_queue: MockResponseQueue,
    build_success_response: BuildSuccessResponse,
    build_queue_with_song: BuildQueue,
) -> BuildQueue:
    def wrapper() -> QueueData:
        queue_data = build_queue_with_song()
        requests_client_get_queue.append(build_success_response(queue_data))
        return queue_data

    return wrapper


@pytest.fixture
def song_in_queue(mock_filled_queue_get: BuildQueue, mock_empty_queue_get: BuildQueue) -> QueueData:
    queue_data = mock_filled_queue_get()
    mock_empty_queue_get()
    return queue_data


@pytest.fixture
def create_spotify_playback_state(
    faker: Faker, mock_datetime_wrapper: MockDateTimeWrapper
) -> CreateSpotifyPlaybackState:
    def wrapper(
        song_data: TrackData,
        playback_left: int = 1000,
        is_playing: bool = True,  # noqa: FBT001, FBT002 - boolean represents internal state, not branching execution
        context: PlaybackContextData = None,
    ) -> PlaybackStateData:
        return {
            "device": {
                "id": faker.uuid4(),
                "is_active": True,
                "is_private_session": False,
                "is_restricted": False,
                "name": "my pc",
                "volume_percent": random.randint(1, 100),
                "supports_volume": False,
            },
            "repeat_state": "track",
            "shuffle_state": False,
            "context": context,
            "timestamp": int(mock_datetime_wrapper.now().timestamp() * 1000),
            # Spotify sends timestamps in milliseconds
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
                "transferring_playback": True,
            },
        }

    return wrapper


@pytest.fixture
def create_spotify_playback(
    requests_client_get_queue: MockResponseQueue,
    create_spotify_playback_state: CreateSpotifyPlaybackState,
    build_success_response: BuildSuccessResponse,
    create_mock_track_search_result: MockTrackSearchResult,
    current_playback_data: CurrentPlaybackData,
    mock_datetime_wrapper: MockDateTimeWrapper,
) -> CreateSpotifyPlayback:
    def wrapper(
        playback_left_ms: int = 500,
        songs_in_queue: int | None = 0,
        song_data: TrackData = None,
        context: PlaybackContextData = None,
    ) -> datetime.datetime:
        song_data = song_data if song_data is not None else current_playback_data.current_track
        playback_state = create_spotify_playback_state(
            song_data,
            playback_left_ms,
            True,  # noqa: FBT003 - state component, not behaviour modifying flag
            context,
        )
        song_end_timestamp = mock_datetime_wrapper.now() + datetime.timedelta(milliseconds=playback_left_ms)
        requests_client_get_queue.append(build_success_response(playback_state))
        if songs_in_queue is not None:
            next_songs = [create_mock_track_search_result() for _ in range(songs_in_queue)]
            queue_tail = [current_playback_data.current_track] * 50
            queue_data = {"currently_playing": song_data, "queue": next_songs + queue_tail}
            requests_client_get_queue.append(build_success_response(queue_data))
        return song_end_timestamp

    return wrapper


@pytest.fixture
def run_scheduling_job(
    playback_service: PoolPlaybackServiceRaw, create_spotify_playback: CreateSpotifyPlayback
) -> RunSchedulingJob:
    async def wrapper() -> None:
        create_spotify_playback()
        await queue_next_songs(playback_service)

    return wrapper


@pytest.fixture
def skip_song(test_client: TestClient, create_spotify_playback: CreateSpotifyPlayback) -> SkipSong:
    def wrapper(headers: Headers) -> httpx.Response:
        create_spotify_playback(50000, 0)
        return test_client.post("/pool/playback/skip", headers=headers)

    return wrapper


@pytest.fixture
def mock_no_player_playback_state_response(requests_client_get_queue: MockResponseQueue) -> MockNoPlayerStateResponse:
    def wrapper() -> None:
        response = Mock()
        response.status_code = 204
        response.content = json.dumps("").encode("utf-8")
        requests_client_get_queue.append(response)

    return wrapper


@pytest.fixture
def mock_playback_paused_response(
    requests_client_get_queue: MockResponseQueue,
    create_spotify_playback_state: CreateSpotifyPlaybackState,
    current_playback_data: CurrentPlaybackData,
    mock_empty_queue_get: BuildQueue,
) -> MockPlaybackPausedResponse:
    def wrapper() -> None:
        response = Mock()
        response.status_code = 204
        response_data = create_spotify_playback_state(current_playback_data.current_track, 5000, False)  # noqa: FBT003
        response.content = json.dumps(response_data).encode("utf-8")
        requests_client_get_queue.append(response)
        mock_empty_queue_get()

    return wrapper


@pytest.fixture
def joined_user_header(
    another_logged_in_user_header: Headers, test_client: TestClient, shared_pool_code: str
) -> Headers:
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    return another_logged_in_user_header


@pytest.fixture
def assert_empty_tables(db_connection: ConnectionManager) -> AssertEmptyTables:
    def wrapper(*tables: type(EntityBase)) -> None:
        with db_connection.session() as session:
            for table in tables:
                assert session.scalar(select(table)) is None

    return wrapper
