from unittest.mock import Mock, call

import pytest
from helpers.classes import ErrorData, MockedPoolContents
from sqlalchemy import and_, select
from sqlalchemy.orm import joinedload
from starlette.testclient import TestClient
from test_types.aliases import MockResponseQueue
from test_types.callables import (
    AssertTokenInHeaders,
    CreatePool,
    CreatePoolCreationDataJson,
    MockPlaylistFetch,
    MockPoolContentFetches,
    MockPutResponse,
    MockTrackSearchResult,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers

from database.database_connection import ConnectionManager
from database.entities import PoolMember, User


@pytest.fixture
def mock_put_response(requests_client_put_queue: MockResponseQueue) -> MockPutResponse:
    def wrapper() -> None:
        response = Mock()
        response.status_code = 200
        response.content = b""
        requests_client_put_queue.append(response)

    return wrapper


@pytest.fixture(autouse=True)
def _auto_mock_put_response(mock_put_response: MockPutResponse) -> None:
    mock_put_response()


def should_create_pool_of_one_song_when_post_pool_called_with_single_song_id(
    validate_response: ValidateResponse, create_pool: CreatePool, mocked_pool_contents: MockedPoolContents
) -> None:
    response = create_pool(tracks=1)

    track = mocked_pool_contents.track
    pool_response = validate_response(response)
    assert pool_response["users"][0]["tracks"][0]["name"] == track["name"]


def should_return_track_data_in_currently_playing_field_on_pool_creation(
    validate_response: ValidateResponse, create_pool: CreatePool, mocked_pool_contents: MockedPoolContents
) -> None:
    response = create_pool(tracks=1)

    track = mocked_pool_contents.track
    pool_response = validate_response(response)
    assert pool_response["currently_playing"]["name"] == track["name"]


def should_return_self_as_pool_owner_on_pool_creation(
    validate_response: ValidateResponse, logged_in_user: User, create_pool: CreatePool
) -> None:
    response = create_pool(tracks=1)

    pool_response = validate_response(response)
    assert pool_response["owner"]["spotify_id"] == logged_in_user.spotify_id


def should_save_pool_in_database_with_user_id_when_created(
    db_connection: ConnectionManager,
    logged_in_user_id: str,
    create_pool: CreatePool,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    create_pool(tracks=1)

    track = mocked_pool_contents.track
    with db_connection.session() as session:
        actual_pool_content = session.scalar(select(PoolMember).where(PoolMember.user_id == logged_in_user_id))
    assert actual_pool_content.duration_ms == track["duration_ms"]


def should_propagate_errors_from_spotify_api(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    create_mock_track_search_result: MockTrackSearchResult,
    create_pool_creation_data_json: CreatePoolCreationDataJson,
    spotify_error_message: ErrorData,
) -> None:
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    json_data = validate_response(response, 502)
    assert json_data["detail"] == (
        f"Error code {spotify_error_message.code} received while calling Spotify API. "
        f"Message: {spotify_error_message.message}"
    )


def should_be_able_to_create_pool_from_album(
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    requests_client: Mock,
    create_pool: CreatePool,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    result = create_pool(albums=[12])

    album = mocked_pool_contents.album
    requests_client.get.assert_called_with(
        f"https://api.spotify.com/v1/albums/{album['id']}", headers=valid_token_header
    )
    pool_response = validate_response(result)
    user_pool = pool_response["users"][0]
    assert user_pool["tracks"] == []
    assert len(user_pool["collections"][0]["tracks"]) == len(album["tracks"]["items"])
    for expected_track, actual_track in zip(album["tracks"]["items"], user_pool["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_save_whole_album_as_pool_in_database(
    db_connection: ConnectionManager,
    logged_in_user_id: str,
    create_pool: CreatePool,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    create_pool(albums=[12])

    album = mocked_pool_contents.album
    with db_connection.session() as session:
        actual_parent = session.scalar(
            select(PoolMember)
            .where(and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))  # noqa: E711
            .options(joinedload(PoolMember.children))
        )
    assert actual_parent.name == album["name"]
    assert len(actual_parent.children) == len(album["tracks"]["items"])
    for expected_track, actual_track in zip(
        album["tracks"]["items"], sorted(actual_parent.children, key=lambda x: x.sort_order)
    ):
        assert actual_track.duration_ms == expected_track["duration_ms"]
        assert actual_track.name == expected_track["name"]


def should_be_able_to_create_pool_from_artist(
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    requests_client: Mock,
    create_pool: CreatePool,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    result = create_pool(artists=1)

    artist = mocked_pool_contents.artist.artist
    tracks = mocked_pool_contents.artist.tracks
    assert requests_client.get.call_args_list[0] == call(
        f"https://api.spotify.com/v1/artists/{artist['id']}", headers=valid_token_header
    )
    assert requests_client.get.call_args_list[1] == call(
        f"https://api.spotify.com/v1/artists/{artist['id']}/top-tracks", headers=valid_token_header
    )
    pool_response = validate_response(result)
    user_pool = pool_response["users"][0]
    assert user_pool["tracks"] == []
    assert len(user_pool["collections"][0]["tracks"]) == len(tracks)
    for expected_track, actual_track in zip(tracks, user_pool["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_save_artist_top_ten_tracks_as_pool_in_database(
    db_connection: ConnectionManager,
    logged_in_user_id: str,
    create_pool: CreatePool,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    create_pool(artists=1)

    artist = mocked_pool_contents.artist.artist
    tracks = mocked_pool_contents.artist.tracks
    with db_connection.session() as session:
        actual_parent = session.scalar(
            select(PoolMember)
            .where(and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))  # noqa: E711
            .options(joinedload(PoolMember.children))
        )
    assert actual_parent.name == artist["name"]
    assert len(actual_parent.children) == len(tracks)
    for expected_track, actual_track in zip(tracks, sorted(actual_parent.children, key=lambda x: x.sort_order)):
        assert actual_track.duration_ms == expected_track["duration_ms"]
        assert actual_track.name == expected_track["name"]


def should_be_able_to_create_pool_from_playlist(
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    create_pool: CreatePool,
    requests_client: Mock,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    result = create_pool(playlists=[30])

    playlist = mocked_pool_contents.playlist.first_fetch
    requests_client.get.assert_called_with(
        f"https://api.spotify.com/v1/playlists/{playlist['id']}", headers=valid_token_header
    )
    pool_response = validate_response(result)
    user_pool = pool_response["users"][0]
    assert user_pool["tracks"] == []
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    assert len(user_pool["collections"][0]["tracks"]) == len(expected_tracks)
    for expected_track, actual_track in zip(expected_tracks, user_pool["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_be_able_to_create_pool_from_playlist_even_if_some_tracks_return_none(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    requests_client: Mock,
    mock_playlist_fetch: MockPlaylistFetch,
    mocked_pool_contents: MockedPoolContents,
    create_pool_creation_data_json: CreatePoolCreationDataJson,
) -> None:
    data_json = create_pool_creation_data_json(mock_playlist_fetch(30, append_none=True)["spotify_uri"])

    result = test_client.post("/pool", json=data_json, headers=valid_token_header)

    playlist = mocked_pool_contents.playlist.first_fetch
    requests_client.get.assert_called_with(
        f"https://api.spotify.com/v1/playlists/{playlist['id']}", headers=valid_token_header
    )
    pool_response = validate_response(result)
    user_pool = pool_response["users"][0]
    assert user_pool["tracks"] == []
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    assert len(user_pool["collections"][0]["tracks"]) == len(expected_tracks) - 1
    for expected_track, actual_track in zip(expected_tracks[:-1], user_pool["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_save_whole_playlist_as_pool_in_database(
    create_pool: CreatePool,
    db_connection: ConnectionManager,
    logged_in_user_id: str,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    create_pool(playlists=[30])

    playlist = mocked_pool_contents.playlist.first_fetch
    with db_connection.session() as session:
        actual_parent = session.scalar(
            select(PoolMember)
            .where(and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))  # noqa: E711
            .options(joinedload(PoolMember.children))
        )
    assert actual_parent.name == playlist["name"]
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    assert len(actual_parent.children) == len(expected_tracks)
    for expected_track, actual_track in zip(
        expected_tracks, sorted(actual_parent.children, key=lambda x: x.sort_order)
    ):
        assert actual_track.name == expected_track["name"]
        assert actual_track.duration_ms == expected_track["duration_ms"]


@pytest.mark.usefixtures("existing_pool")
def should_delete_previous_pool_on_post_pool_call(
    db_connection: ConnectionManager,
    logged_in_user_id: str,
    mock_put_response: MockPutResponse,
    create_pool: CreatePool,
) -> None:
    mock_put_response()

    create_pool(albums=[12])

    with db_connection.session() as session:
        actual_results = (
            session.scalars(
                select(PoolMember)
                .where(and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))  # noqa: E711
                .options(joinedload(PoolMember.children))
            )
            .unique()
            .all()
        )
    assert len(actual_results) == 1


def should_be_able_to_post_multiple_pool_members_on_creation(
    create_pool: CreatePool,
    validate_response: ValidateResponse,
    logged_in_user_id: str,
    db_connection: ConnectionManager,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    response = create_pool(tracks=10, artists=1, albums=[12], playlists=[23])

    tracks = mocked_pool_contents.tracks
    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["tracks"]) == len(tracks)
    assert len(user_pool["collections"]) == 3
    with db_connection.session() as session:
        actual_results = (
            session.scalars(
                select(PoolMember)
                .where(and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))  # noqa: E711
                .options(joinedload(PoolMember.children))
            )
            .unique()
            .all()
        )
        assert len(actual_results) == len(tracks) + 3


@pytest.mark.slow
def should_fetch_multiple_times_if_playlist_is_too_long_to_fetch_in_one_go(
    valid_token_header: Headers,
    db_connection: ConnectionManager,
    logged_in_user_id: str,
    mocked_pool_contents: MockedPoolContents,
    create_pool: CreatePool,
    requests_client: Mock,
) -> None:
    playlist_length = 320
    create_pool(playlists=[playlist_length])

    playlist = mocked_pool_contents.playlist.first_fetch
    with db_connection.session() as session:
        actual_parent = session.scalar(
            select(PoolMember)
            .where(and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))  # noqa: E711
            .options(joinedload(PoolMember.children))
        )
    assert actual_parent.name == playlist["name"]
    assert len(actual_parent.children) == playlist_length
    assert requests_client.get.call_args.kwargs["headers"] == valid_token_header


def should_include_token_in_headers(
    test_client: TestClient,
    valid_token_header: Headers,
    assert_token_in_headers: AssertTokenInHeaders,
    mock_pool_content_fetches: MockPoolContentFetches,
) -> None:
    data_json = mock_pool_content_fetches(tracks=1)
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    assert_token_in_headers(response)
