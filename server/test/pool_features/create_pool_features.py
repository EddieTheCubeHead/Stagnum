from typing import Callable
from unittest.mock import Mock, call

import pytest
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from starlette.testclient import TestClient

from database.database_connection import ConnectionManager
from database.entities import PoolMember, User
from helpers.classes import ErrorData
from pool_features.conftest import MockPlaylistFetchResult
from test_types.typed_dictionaries import Headers, PlaylistData
from test_types.aliases import MockResponseQueue
from test_types.callables import ValidateResponse, MockTrackSearchResult, \
    BuildSuccessResponse, CreatePoolCreationDataJson, MockAlbumSearchResult, \
    MockArtistSearchResult, AssertTokenInHeaders

mock_put_response_callable = Callable[[], None]


@pytest.fixture
def mock_put_response(requests_client_put_queue: MockResponseQueue) -> mock_put_response_callable:
    def wrapper():
        response = Mock()
        response.status_code = 200
        response.content = "".encode("utf-8")
        requests_client_put_queue.append(response)

    return wrapper


@pytest.fixture(autouse=True)
def auto_mock_put_response(mock_put_response) -> None:
    mock_put_response()


def should_create_pool_of_one_song_when_post_pool_called_with_single_song_id(
        test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse,
        create_mock_track_search_result: MockTrackSearchResult,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: CreatePoolCreationDataJson):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    pool_response = validate_response(response)
    assert pool_response["users"][0]["tracks"][0]["name"] == my_track["name"]


def should_return_track_data_in_currently_playing_field_on_pool_creation(
        test_client: TestClient, valid_token_header, validate_response: ValidateResponse,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_mock_track_search_result: MockTrackSearchResult,
        create_pool_creation_data_json: CreatePoolCreationDataJson):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    pool_response = validate_response(response)
    assert pool_response["currently_playing"]["name"] == my_track["name"]


def should_return_self_as_pool_owner_on_pool_creation(
        test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_mock_track_search_result: MockTrackSearchResult, logged_in_user: User,
        create_pool_creation_data_json: CreatePoolCreationDataJson):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    pool_response = validate_response(response)
    assert pool_response["owner"]["spotify_id"] == logged_in_user.spotify_id


def should_save_pool_in_database_with_user_id_when_created(
        test_client: TestClient, db_connection: ConnectionManager, valid_token_header: Headers,
        create_mock_track_search_result: MockTrackSearchResult, logged_in_user_id: str,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: CreatePoolCreationDataJson):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    test_client.post("/pool", json=data_json, headers=valid_token_header)
    with db_connection.session() as session:
        actual_pool_content = session.scalar(select(PoolMember).where(PoolMember.user_id == logged_in_user_id))
    assert actual_pool_content.duration_ms == my_track["duration_ms"]


def should_propagate_errors_from_spotify_api(test_client: TestClient, valid_token_header: Headers,
                                             validate_response: ValidateResponse,
                                             create_mock_track_search_result: MockTrackSearchResult,
                                             create_pool_creation_data_json: CreatePoolCreationDataJson,
                                             spotify_error_message: ErrorData):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    json_data = validate_response(response, 502)
    assert json_data["detail"] == (f"Error code {spotify_error_message.code} received while calling Spotify API. "
                                   f"Message: {spotify_error_message.message}")


def should_be_able_to_create_pool_from_album(test_client: TestClient, valid_token_header: Headers,
                                             create_mock_album_search_result: MockAlbumSearchResult,
                                             validate_response: ValidateResponse,
                                             create_mock_track_search_result: MockTrackSearchResult,
                                             create_mock_artist_search_result: MockArtistSearchResult,
                                             build_success_response: BuildSuccessResponse,
                                             requests_client_get_queue: MockResponseQueue, requests_client: Mock,
                                             create_pool_creation_data_json: CreatePoolCreationDataJson):
    artist = create_mock_artist_search_result()
    tracks = [create_mock_track_search_result(artist) for _ in range(12)]
    album = create_mock_album_search_result(artist, tracks)
    requests_client_get_queue.append(build_success_response(album))
    data_json = create_pool_creation_data_json(album["uri"])

    result = test_client.post("/pool", json=data_json, headers=valid_token_header)

    requests_client.get.assert_called_with(f"https://api.spotify.com/v1/albums/{album['id']}",
                                           headers=valid_token_header)
    pool_response = validate_response(result)
    user_pool = pool_response["users"][0]
    assert user_pool["tracks"] == []
    assert len(user_pool["collections"][0]["tracks"]) == len(tracks)
    for expected_track, actual_track in zip(tracks, user_pool["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_save_whole_album_as_pool_in_database(test_client: TestClient, valid_token_header: Headers,
                                                db_connection: ConnectionManager,
                                                create_mock_album_search_result: MockAlbumSearchResult,
                                                create_mock_track_search_result: MockTrackSearchResult,
                                                create_mock_artist_search_result: MockArtistSearchResult,
                                                build_success_response: BuildSuccessResponse,
                                                requests_client_get_queue: MockResponseQueue,
                                                create_pool_creation_data_json: CreatePoolCreationDataJson,
                                                logged_in_user_id: str):
    artist = create_mock_artist_search_result()
    tracks = [create_mock_track_search_result(artist) for _ in range(12)]
    album = create_mock_album_search_result(artist, tracks)
    requests_client_get_queue.append(build_success_response(album))
    data_json = create_pool_creation_data_json(album["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_parent = session.scalar(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children)))
    assert actual_parent.name == album["name"]
    assert len(actual_parent.children) == len(tracks)
    for expected_track, actual_track in zip(tracks, sorted(actual_parent.children, key=lambda x: x.sort_order)):
        assert actual_track.duration_ms == expected_track["duration_ms"]
        assert actual_track.name == expected_track["name"]


def should_be_able_to_create_pool_from_artist(test_client: TestClient, valid_token_header: Headers,
                                              validate_response: ValidateResponse, requests_client: Mock,
                                              create_mock_track_search_result: MockTrackSearchResult,
                                              create_mock_artist_search_result: MockArtistSearchResult,
                                              build_success_response: BuildSuccessResponse,
                                              create_pool_creation_data_json: CreatePoolCreationDataJson,
                                              requests_client_get_queue: MockResponseQueue):
    artist = create_mock_artist_search_result()
    tracks = {
        "tracks": [create_mock_track_search_result(artist) for _ in range(10)]
    }
    requests_client_get_queue.extend([build_success_response(artist), build_success_response(tracks)])
    data_json = create_pool_creation_data_json(artist["uri"])

    result = test_client.post("/pool", json=data_json, headers=valid_token_header)

    assert requests_client.get.call_args_list[0] == call(f"https://api.spotify.com/v1/artists/{artist['id']}",
                                                         headers=valid_token_header)
    assert (requests_client.get.call_args_list[1]
            == call(f"https://api.spotify.com/v1/artists/{artist['id']}/top-tracks",
                    headers=valid_token_header))
    pool_response = validate_response(result)
    user_pool = pool_response["users"][0]
    assert user_pool["tracks"] == []
    assert len(user_pool["collections"][0]["tracks"]) == len(tracks["tracks"])
    for expected_track, actual_track in zip(tracks["tracks"], user_pool["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_save_artist_top_ten_tracks_as_pool_in_database(
        test_client: TestClient, valid_token_header: Headers, db_connection: ConnectionManager,
        create_mock_artist_search_result: MockArtistSearchResult, logged_in_user_id: str,
        create_mock_track_search_result: MockTrackSearchResult,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: CreatePoolCreationDataJson):
    artist = create_mock_artist_search_result()
    tracks = {
        "tracks": [create_mock_track_search_result(artist) for _ in range(10)]
    }
    requests_client_get_queue.extend([build_success_response(artist), build_success_response(tracks)])
    data_json = create_pool_creation_data_json(artist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_parent = session.scalar(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children)))
    assert actual_parent.name == artist["name"]
    assert len(actual_parent.children) == len(tracks["tracks"])
    for expected_track, actual_track in zip(tracks["tracks"],
                                            sorted(actual_parent.children, key=lambda x: x.sort_order)):
        assert actual_track.duration_ms == expected_track["duration_ms"]
        assert actual_track.name == expected_track["name"]


def should_be_able_to_create_pool_from_playlist(
        test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse,
        create_mock_playlist_fetch_result: MockPlaylistFetchResult, requests_client: Mock,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: CreatePoolCreationDataJson):
    playlist: PlaylistData = create_mock_playlist_fetch_result(30)
    requests_client_get_queue.append(build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    result = test_client.post("/pool", json=data_json, headers=valid_token_header)

    requests_client.get.assert_called_with(f"https://api.spotify.com/v1/playlists/{playlist['id']}",
                                           headers=valid_token_header)
    pool_response = validate_response(result)
    user_pool = pool_response["users"][0]
    assert user_pool["tracks"] == []
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    assert len(user_pool["collections"][0]["tracks"]) == len(expected_tracks)
    for expected_track, actual_track in zip(expected_tracks, user_pool["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_be_able_to_create_pool_from_playlist_even_if_some_tracks_return_none(
        test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse,
        create_mock_playlist_fetch_result: MockPlaylistFetchResult, requests_client: Mock,
        create_mock_track_search_result: MockTrackSearchResult,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: CreatePoolCreationDataJson):
    playlist: PlaylistData = create_mock_playlist_fetch_result(30, True)
    requests_client_get_queue.append(build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    result = test_client.post("/pool", json=data_json, headers=valid_token_header)

    requests_client.get.assert_called_with(f"https://api.spotify.com/v1/playlists/{playlist['id']}",
                                           headers=valid_token_header)
    pool_response = validate_response(result)
    user_pool = pool_response["users"][0]
    assert user_pool["tracks"] == []
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    assert len(user_pool["collections"][0]["tracks"]) == len(expected_tracks) - 1
    for expected_track, actual_track in zip(expected_tracks[:-1], user_pool["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_save_whole_playlist_as_pool_in_database(
        test_client: TestClient, valid_token_header: Headers, db_connection: ConnectionManager,
        logged_in_user_id: str, create_mock_playlist_fetch_result: MockPlaylistFetchResult,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: CreatePoolCreationDataJson):
    playlist: PlaylistData = create_mock_playlist_fetch_result(30)
    requests_client_get_queue.append(build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_parent = session.scalar(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children)))
    assert actual_parent.name == playlist["name"]
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    assert len(actual_parent.children) == len(expected_tracks)
    for expected_track, actual_track in zip(expected_tracks, sorted(actual_parent.children, key=lambda x: x.sort_order)):
        assert actual_track.name == expected_track["name"]
        assert actual_track.duration_ms == expected_track["duration_ms"]


def should_delete_previous_pool_on_post_pool_call(
        test_client: TestClient, valid_token_header: Headers, db_connection: ConnectionManager,
        create_mock_album_search_result: MockAlbumSearchResult, logged_in_user_id: str,
        create_mock_track_search_result: MockTrackSearchResult,
        create_mock_artist_search_result: MockArtistSearchResult,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: CreatePoolCreationDataJson,
        mock_put_response: mock_put_response_callable):
    old_artist = create_mock_artist_search_result()
    old_tracks = [create_mock_track_search_result(old_artist) for _ in range(12)]
    old_album = create_mock_album_search_result(old_artist, old_tracks)
    requests_client_get_queue.append(build_success_response(old_album))
    old_data_json = create_pool_creation_data_json(old_album["uri"])
    test_client.post("/pool", json=old_data_json, headers=valid_token_header)

    artist = create_mock_artist_search_result()
    tracks = [create_mock_track_search_result(artist) for _ in range(12)]
    album = create_mock_album_search_result(artist, tracks)
    requests_client_get_queue.append(build_success_response(album))
    data_json = create_pool_creation_data_json(album["uri"])
    mock_put_response()

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_results = session.scalars(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children))).unique().all()
    assert len(actual_results) == 1


def should_be_able_to_post_multiple_pool_members_on_creation(
        test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse,
        create_mock_track_search_result: MockTrackSearchResult, logged_in_user_id: str,
        build_success_response: BuildSuccessResponse, requests_client_get_queue: MockResponseQueue,
        create_pool_creation_data_json: CreatePoolCreationDataJson, db_connection: ConnectionManager,
        create_mock_artist_search_result: MockArtistSearchResult,
        create_mock_album_search_result: MockAlbumSearchResult,
        create_mock_playlist_fetch_result: MockPlaylistFetchResult):
    tracks = [create_mock_track_search_result() for _ in range(10)]
    artist = create_mock_artist_search_result()
    artist_tracks = {"tracks": [create_mock_track_search_result(artist) for _ in range(10)]}
    album = create_mock_album_search_result(artist, [create_mock_track_search_result(artist) for _ in range(12)])
    playlist = create_mock_playlist_fetch_result(23)
    responses = [build_success_response(track) for track in tracks]
    responses.extend([build_success_response(artist), build_success_response(artist_tracks),
                      build_success_response(album), build_success_response(playlist)])
    requests_client_get_queue.extend(responses)
    data_json = create_pool_creation_data_json(*[track["uri"] for track in tracks], artist["uri"], album["uri"],
                                               playlist["uri"])

    response = test_client.post("/pool", json=data_json, headers=valid_token_header)

    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["tracks"]) == len(tracks)
    assert len(user_pool["collections"]) == 3

    with db_connection.session() as session:
        actual_results = session.scalars(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                         .options(joinedload(PoolMember.children))).unique().all()
        assert len(actual_results) == len(tracks) + 3


@pytest.mark.slow
def should_fetch_multiple_times_if_playlist_is_too_long_to_fetch_in_one_go(
        test_client: TestClient, valid_token_header: Headers, db_connection: ConnectionManager,
        requests_client_get_queue: MockResponseQueue, logged_in_user_id: str,
        create_mock_playlist_fetch_result: MockPlaylistFetchResult,
        build_success_response: BuildSuccessResponse,
        create_pool_creation_data_json: CreatePoolCreationDataJson,
        requests_client: Mock):
    playlist_length = 320
    playlist_fetches: tuple[PlaylistData, ...] = create_mock_playlist_fetch_result(playlist_length)
    playlist = playlist_fetches[0]
    responses = [build_success_response(data_point) for data_point in playlist_fetches]
    requests_client_get_queue.extend(responses)
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_parent = session.scalar(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children)))
    assert actual_parent.name == playlist["name"]
    assert len(actual_parent.children) == playlist_length
    assert requests_client.get.call_args.kwargs["headers"] == valid_token_header


def should_include_token_in_headers(test_client: TestClient, valid_token_header: Headers,
                                    requests_client_get_queue: MockResponseQueue,
                                    create_mock_track_search_result: MockTrackSearchResult,
                                    build_success_response: BuildSuccessResponse,
                                    assert_token_in_headers: AssertTokenInHeaders,
                                    create_pool_creation_data_json: CreatePoolCreationDataJson):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client_get_queue.append(build_success_response(my_track))
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    assert_token_in_headers(response)
