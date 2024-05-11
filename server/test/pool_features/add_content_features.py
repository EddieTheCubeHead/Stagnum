from sqlalchemy import select, and_
from starlette.testclient import TestClient

from api.pool.models import PoolContent
from database.database_connection import ConnectionManager
from database.entities import PoolMember
from helpers.classes import ErrorData, MockedPoolContents
from test_types.callables import MockTrackSearchResult, ValidateResponse, AssertTokenInHeaders, MockTrackFetch, \
    MockPlaylistFetch, MockAlbumFetch
from test_types.typed_dictionaries import Headers


def should_create_a_pool_member_for_user_even_if_user_pool_is_empty(mock_track_fetch: MockTrackFetch,
                                                                    test_client: TestClient,
                                                                    valid_token_header: Headers,
                                                                    validate_response: ValidateResponse):
    pool_content_data = mock_track_fetch()

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


def should_save_the_pool_member_to_database_even_if_user_pool_is_empty(mock_track_fetch: MockTrackFetch,
                                                                       test_client: TestClient,
                                                                       valid_token_header: Headers,
                                                                       db_connection: ConnectionManager,
                                                                       logged_in_user_id: str):
    pool_content_data = mock_track_fetch()

    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalar(select(PoolMember).where(PoolMember.user_id == logged_in_user_id))
    assert actual_pool_content is not None


def should_preserve_existing_pool_members_on_new_member_addition(mock_track_fetch: MockTrackFetch,
                                                                 test_client: TestClient,
                                                                 valid_token_header: Headers,
                                                                 db_connection: ConnectionManager,
                                                                 logged_in_user_id: str,
                                                                 existing_pool: list[PoolMember]):
    pool_content_data = mock_track_fetch()

    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalars(
            select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    assert len(actual_pool_content) == len(existing_pool) + 1


def should_correctly_construct_pool_after_collection_addition(mock_playlist_fetch: MockPlaylistFetch,
                                                              test_client: TestClient, valid_token_header: Headers,
                                                              db_connection: ConnectionManager, logged_in_user_id: str,
                                                              existing_pool: list[PoolMember],
                                                              mocked_pool_contents: MockedPoolContents,
                                                              validate_response: ValidateResponse):
    pool_content_data = mock_playlist_fetch(35)

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalars(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))).unique().all()
    assert len(actual_pool_content) == len(existing_pool) + 1
    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    playlist = mocked_pool_contents.playlist.first_fetch
    assert len(user_pool["collections"][0]["tracks"]) == len(playlist["tracks"]["items"])


def should_use_collection_icon_as_track_icon_on_collection_addition(mock_album_fetch: MockAlbumFetch,
                                                                    valid_token_header: Headers,
                                                                    validate_response: ValidateResponse,
                                                                    existing_pool: list[PoolMember],
                                                                    test_client: TestClient,
                                                                    mocked_pool_contents: MockedPoolContents):
    pool_content_data = mock_album_fetch()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    album = mocked_pool_contents.album
    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    for track in user_pool["collections"][0]["tracks"]:
        assert track["spotify_icon_uri"] == album["images"][0]["url"]


def should_include_current_token_in_response_headers(test_client: TestClient, valid_token_header: Headers,
                                                     assert_token_in_headers: AssertTokenInHeaders,
                                                     mock_track_fetch: MockTrackFetch):
    pool_content_data = mock_track_fetch()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    assert_token_in_headers(response)
