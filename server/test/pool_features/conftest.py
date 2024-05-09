import datetime
import json
import random
from typing import Any
from unittest.mock import Mock

import httpx
import pytest
from _pytest.fixtures import FixtureRequest
from _pytest.monkeypatch import MonkeyPatch
from faker import Faker
from starlette.testclient import TestClient

from api.auth.dependencies import AuthDatabaseConnection
from api.common.dependencies import RequestsClient, SpotifyClientRaw, TokenHolderRaw
from api.common.models import ParsedTokenResponse
from api.pool import queue_next_songs
from api.pool.dependencies import PoolDatabaseConnectionRaw, PoolSpotifyClientRaw, PoolPlaybackServiceRaw, \
    WebsocketUpdaterRaw
from api.pool.models import PoolContent, PoolCreationData
from api.pool.randomization_algorithms import NextSongProvider, RandomizationParameters
from api.search.models import PaginatedSearchResult
from database.database_connection import ConnectionManager
from database.entities import User
from helpers.classes import MockDateTimeWrapper, CurrentPlaybackData, MockedPoolContents, MockedArtistPoolContent, \
    MockedPlaylistPoolContent
from test_types.aliases import MockResponseQueue
from test_types.callables import MockTrackSearchResult, BuildSuccessResponse, \
    CreatePoolCreationDataJson, ValidateResponse, CreateSpotifyPlaybackState, \
    MockNoPlayerStateResponse, MockPlaybackPausedResponse, SkipSong, \
    CreateSpotifyPlayback, RunSchedulingJob, MockPlaylistFetchResult, \
    SharePoolAndGetCode, BuildQueue, MockPoolContentFetches, MockArtistSearchResult, MockAlbumSearchResult, \
    MockTrackFetch, MockArtistFetch, MockAlbumFetch, MockPlaylistFetch
from test_types.typed_dictionaries import TrackData, PlaybackStateData, PlaybackContextData, Headers, QueueData, \
    PlaylistData, PoolContentData, PoolCreationDataDict, ArtistData, PaginatedSearchResultData, PlaylistTrackData


@pytest.fixture
def current_playback_data() -> CurrentPlaybackData:
    return CurrentPlaybackData()


@pytest.fixture
def create_mock_playlist_fetch_result(create_mock_track_search_result: MockTrackSearchResult,
                                      faker: Faker) -> MockPlaylistFetchResult:
    def wrapper(track_amount: int, append_none: bool = False) -> MockedPlaylistPoolContent:
        user = faker.name().replace(" ", "")
        playlist_id = faker.uuid4()
        tracks: list[TrackData | None] = [create_mock_track_search_result() for _ in range(track_amount)]
        if append_none:
            tracks.append(None)
        playlist_tracks: list[PlaylistTrackData] = []
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
        further_fetches: list[PaginatedSearchResultData] = []
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
        return MockedPlaylistPoolContent(first_fetch=playlist_data, further_fetches=further_fetches)

    return wrapper


@pytest.fixture
def fixed_track_length_ms(minutes: int = 3, seconds: int = 30) -> int:
    return (minutes * 60 + seconds) * 1000


@pytest.fixture
def existing_playback(db_connection: ConnectionManager,
                      create_mock_track_search_result: MockTrackSearchResult,
                      build_success_response: BuildSuccessResponse,
                      requests_client_get_queue: MockResponseQueue,
                      create_pool_creation_data_json: CreatePoolCreationDataJson,
                      test_client: TestClient, valid_token_header: Headers, fixed_track_length_ms: int,
                      request: FixtureRequest, current_playback_data: CurrentPlaybackData,
                      validate_response: ValidateResponse) -> list[TrackData]:
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
def another_logged_in_user_header(another_logged_in_user_token: str) -> Headers:
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


@pytest.fixture
def share_pool_and_get_code(test_client: TestClient, valid_token_header: Headers,
                            validate_response: ValidateResponse) -> SharePoolAndGetCode:
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
def shared_pool_code(existing_playback: list[TrackData],
                     share_pool_and_get_code: SharePoolAndGetCode) -> str:
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
def build_empty_queue(create_mock_track_search_result: MockTrackSearchResult,
                      current_playback_data: CurrentPlaybackData) -> BuildQueue:
    def wrapper() -> QueueData:
        currently_playing = create_mock_track_search_result()
        queue_tail = [current_playback_data.current_track] * 50
        return {
            "currently_playing": currently_playing,
            "queue": queue_tail,
        }

    return wrapper


@pytest.fixture
def mock_empty_queue_get(requests_client_get_queue: MockResponseQueue,
                         build_success_response: BuildSuccessResponse,
                         build_empty_queue: BuildQueue) -> BuildQueue:
    def wrapper() -> QueueData:
        queue_data = build_empty_queue()
        requests_client_get_queue.append(build_success_response(queue_data))
        return queue_data

    return wrapper


@pytest.fixture
def empty_queue(mock_empty_queue_get: BuildQueue) -> QueueData:
    return mock_empty_queue_get()


@pytest.fixture
def build_queue_with_song(create_mock_track_search_result: MockTrackSearchResult,
                          current_playback_data: CurrentPlaybackData) -> BuildQueue:
    def wrapper() -> QueueData:
        currently_playing = create_mock_track_search_result()
        next_song = create_mock_track_search_result()
        queue_tail = [current_playback_data.current_track] * 50
        return {
            "currently_playing": currently_playing,
            "queue": [next_song] + queue_tail,
        }

    return wrapper


@pytest.fixture
def mock_filled_queue_get(requests_client_get_queue: MockResponseQueue,
                          build_success_response: BuildSuccessResponse,
                          build_queue_with_song: BuildQueue) -> BuildQueue:
    def wrapper() -> QueueData:
        queue_data = build_queue_with_song()
        requests_client_get_queue.append(build_success_response(queue_data))
        return queue_data

    return wrapper


@pytest.fixture
def song_in_queue(mock_filled_queue_get: BuildQueue,
                  mock_empty_queue_get: BuildQueue) -> QueueData:
    queue_data = mock_filled_queue_get()
    mock_empty_queue_get()
    return queue_data


@pytest.fixture
def create_spotify_playback_state(faker: Faker, create_mock_track_search_result: MockTrackSearchResult,
                                  mock_datetime_wrapper: MockDateTimeWrapper) -> CreateSpotifyPlaybackState:
    def wrapper(song_data: TrackData, playback_left: int = 1000, is_playing: bool = True,
                context: PlaybackContextData = None) -> PlaybackStateData:
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
                "transferring_playback": True
            }
        }

    return wrapper


@pytest.fixture
def create_spotify_playback(requests_client_get_queue: MockResponseQueue,
                            create_spotify_playback_state: CreateSpotifyPlaybackState,
                            build_success_response: BuildSuccessResponse,
                            create_mock_track_search_result: MockTrackSearchResult,
                            current_playback_data: CurrentPlaybackData, mock_datetime_wrapper: MockDateTimeWrapper) \
        -> CreateSpotifyPlayback:
    def wrapper(playback_left_ms: int = 500, songs_in_queue: int | None = 0, song_data: TrackData = None,
                context: PlaybackContextData = None) -> datetime.datetime:
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


@pytest.fixture
def run_scheduling_job(playback_service: PoolPlaybackServiceRaw,
                       create_spotify_playback: CreateSpotifyPlayback) -> RunSchedulingJob:
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
def mock_no_player_playback_state_response(requests_client_get_queue: MockResponseQueue) \
        -> MockNoPlayerStateResponse:
    def wrapper() -> None:
        response = Mock()
        response.status_code = 204
        response.content = json.dumps("").encode("utf-8")
        requests_client_get_queue.append(response)

    return wrapper


@pytest.fixture
def mock_playback_paused_response(requests_client_get_queue: MockResponseQueue,
                                  create_spotify_playback_state: CreateSpotifyPlaybackState,
                                  current_playback_data: CurrentPlaybackData,
                                  mock_empty_queue_get: BuildQueue) \
        -> MockPlaybackPausedResponse:
    def wrapper() -> None:
        response = Mock()
        response.status_code = 204
        response_data = create_spotify_playback_state(current_playback_data.current_track, 5000, False)
        response.content = json.dumps(response_data).encode("utf-8")
        requests_client_get_queue.append(response)
        mock_empty_queue_get()

    return wrapper


@pytest.fixture
def mock_track_fetch(create_mock_track_search_result: MockTrackSearchResult,
                     requests_client_get_queue: MockResponseQueue, mocked_pool_contents: MockedPoolContents,
                     build_success_response: BuildSuccessResponse) -> MockTrackFetch:
    def wrapper(artist_in: ArtistData = None) -> PoolContentData:
        track = create_mock_track_search_result(artist_in)
        mocked_pool_contents.tracks.append(track)
        requests_client_get_queue.append(build_success_response(track))
        return PoolContent(spotify_uri=track["uri"]).model_dump()

    return wrapper


@pytest.fixture
def mock_artist_fetch(create_mock_artist_search_result: MockArtistSearchResult,
                      create_mock_track_search_result: MockTrackSearchResult,
                      requests_client_get_queue: MockResponseQueue, mocked_pool_contents: MockedPoolContents,
                      build_success_response: BuildSuccessResponse) -> MockArtistFetch:
    def wrapper() -> PoolContentData:
        artist = create_mock_artist_search_result()
        tracks = {
            "tracks": [create_mock_track_search_result(artist) for _ in range(10)]
        }
        mocked_pool_contents.artists.append(MockedArtistPoolContent(artist=artist, tracks=tracks["tracks"]))
        requests_client_get_queue.extend([build_success_response(artist), build_success_response(tracks)])
        return PoolContent(spotify_uri=artist["uri"]).model_dump()

    return wrapper


@pytest.fixture
def mock_album_fetch(create_mock_album_search_result: MockAlbumSearchResult,
                     create_mock_artist_search_result: MockArtistSearchResult,
                     create_mock_track_search_result: MockTrackSearchResult,
                     requests_client_get_queue: MockResponseQueue, mocked_pool_contents: MockedPoolContents,
                     build_success_response: BuildSuccessResponse) -> MockAlbumFetch:
    def wrapper(album_length: int = 12) -> PoolContentData:
        artist = create_mock_artist_search_result()
        tracks = [create_mock_track_search_result(artist) for _ in range(album_length)]
        album = create_mock_album_search_result(artist, tracks)
        mocked_pool_contents.albums.append(album)
        requests_client_get_queue.append(build_success_response(album))
        return PoolContent(spotify_uri=artist["uri"]).model_dump()

    return wrapper


@pytest.fixture
def mock_playlist_fetch(create_mock_playlist_fetch_result: MockPlaylistFetchResult,
                        requests_client_get_queue: MockResponseQueue, mocked_pool_contents: MockedPoolContents,
                        build_success_response: BuildSuccessResponse) -> MockPlaylistFetch:
    def wrapper(playlist_length: int = 30, append_none: bool = False) -> PoolContentData:
        playlist_fetch_data = create_mock_playlist_fetch_result(playlist_length, append_none)
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
def mock_pool_content_fetches(mock_track_fetch: MockTrackFetch, mock_artist_fetch: MockArtistFetch,
                              mock_album_fetch: MockAlbumFetch, mock_playlist_fetch: MockPlaylistFetch,
                              requests_client_get_queue: MockResponseQueue,
                              build_success_response: BuildSuccessResponse) -> MockPoolContentFetches:
    def wrapper(tracks: int = 0, artists: int = 0, albums: list[int] = None,
                playlists: list[int] = None) -> PoolCreationDataDict:
        content_models: list[PoolContentData] = []
        for _ in range(tracks):
            content_models.append(mock_track_fetch())
        for _ in range(artists):
            content_models.append(mock_artist_fetch())
        for album_length in (albums if albums is not None else []):
            content_models.append(mock_album_fetch(album_length))
        for playlist_length in (playlists if playlists is not None else []):
            content_models.append(mock_playlist_fetch(playlist_length))
        return PoolCreationData(spotify_uris=content_models).model_dump()

    return wrapper
