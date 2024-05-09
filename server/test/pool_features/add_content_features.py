from sqlalchemy import select, and_
from starlette.testclient import TestClient

from api.pool.models import PoolContent
from database.database_connection import ConnectionManager
from database.entities import PoolMember
from helpers.classes import ErrorData
from pool_features.conftest import MockPlaylistFetchResult
from test_types.callables import MockTrackSearchResult, BuildSuccessResponse, \
    ValidateResponse, MockArtistSearchResult, MockAlbumSearchResult, \
    AssertTokenInHeaders
from test_types.aliases import MockResponseQueue
from test_types.typed_dictionaries import Headers


def should_create_a_pool_member_for_user_even_if_user_pool_is_empty(
        create_mock_track_search_result: MockTrackSearchResult, test_client: TestClient,
        requests_client_get_queue: MockResponseQueue, build_success_response: BuildSuccessResponse,
        valid_token_header: Headers, validate_response: ValidateResponse):
    track = create_mock_track_search_result()
    requests_client_get_queue.append(build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["users"][0]["tracks"]) == 1


def should_propagate_errors_from_spotify_api(create_mock_track_search_result: MockTrackSearchResult,
                                             test_client: TestClient, valid_token_header: Headers,
                                             validate_response: ValidateResponse,
                                             spotify_error_message: ErrorData):
    track = create_mock_track_search_result()
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    json_data = validate_response(response, 502)
    assert json_data["detail"] == (f"Error code {spotify_error_message.code} received while calling Spotify API. "
                                   f"Message: {spotify_error_message.message}")


def should_save_the_pool_member_to_database_even_if_user_pool_is_empty(
        create_mock_track_search_result: MockTrackSearchResult, test_client: TestClient,
        requests_client_get_queue: MockResponseQueue, build_success_response: BuildSuccessResponse,
        valid_token_header: Headers, db_connection: ConnectionManager, logged_in_user_id: str):
    track = create_mock_track_search_result()
    requests_client_get_queue.append(build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalar(select(PoolMember).where(PoolMember.user_id == logged_in_user_id))
    assert actual_pool_content is not None


def should_preserve_existing_pool_members_on_new_member_addition(
        create_mock_track_search_result: MockTrackSearchResult, test_client: TestClient,
        requests_client_get_queue: MockResponseQueue, build_success_response: BuildSuccessResponse,
        valid_token_header: Headers, db_connection: ConnectionManager, logged_in_user_id: str,
        existing_pool: list[PoolMember]):
    track = create_mock_track_search_result()
    requests_client_get_queue.append(build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalars(
            select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    assert len(actual_pool_content) == len(existing_pool) + 1


def should_correctly_construct_pool_after_collection_addition(
        requests_client_get_queue: MockResponseQueue, build_success_response: BuildSuccessResponse,
        test_client: TestClient, valid_token_header: Headers, db_connection: ConnectionManager,
        logged_in_user_id: str, existing_pool: list[PoolMember], validate_response: ValidateResponse,
        create_mock_playlist_fetch_result: MockPlaylistFetchResult):
    playlist = create_mock_playlist_fetch_result(35).first_fetch
    requests_client_get_queue.append(build_success_response(playlist))
    pool_content_data = PoolContent(spotify_uri=playlist["uri"]).model_dump()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalars(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))).unique().all()
    assert len(actual_pool_content) == len(existing_pool) + 1
    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["collections"][0]["tracks"]) == len(playlist["tracks"]["items"])


def should_use_collection_icon_as_track_icon_on_collection_addition(
        create_mock_track_search_result: MockTrackSearchResult, valid_token_header: Headers,
        build_success_response: BuildSuccessResponse, validate_response: ValidateResponse,
        existing_pool: list[PoolMember], requests_client_get_queue: MockResponseQueue, test_client: TestClient,
        create_mock_artist_search_result: MockArtistSearchResult,
        create_mock_album_search_result: MockAlbumSearchResult):
    artist = create_mock_artist_search_result()
    tracks = [create_mock_track_search_result(artist) for _ in range(8)]
    album = create_mock_album_search_result(artist, tracks)
    requests_client_get_queue.append(build_success_response(album))
    pool_content_data = PoolContent(spotify_uri=album["uri"]).model_dump()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    for track in user_pool["collections"][0]["tracks"]:
        assert track["spotify_icon_uri"] == album["images"][0]["url"]


def should_include_current_token_in_response_headers(create_mock_track_search_result: MockTrackSearchResult,
                                                     requests_client_get_queue: MockResponseQueue,
                                                     build_success_response: BuildSuccessResponse,
                                                     test_client: TestClient, valid_token_header: Headers,
                                                     assert_token_in_headers: AssertTokenInHeaders):
    track = create_mock_track_search_result()
    requests_client_get_queue.append(build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    assert_token_in_headers(response)
