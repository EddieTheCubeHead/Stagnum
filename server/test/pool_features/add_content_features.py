import pytest
from helpers.classes import ErrorData, MockedPoolContents
from sqlalchemy import and_, select
from starlette.testclient import TestClient
from test_types.aliases import MockResponseQueue
from test_types.callables import (
    AssertTokenInHeaders,
    BuildSuccessResponse,
    MockAlbumFetch,
    MockAlbumSearchResult,
    MockArtistSearchResult,
    MockPlaylistFetch,
    MockTrackFetch,
    MockTrackSearchResult,
    ValidateErrorResponse,
    ValidateModel,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers

from api.pool.models import PoolContent, PoolFullContents
from database.database_connection import ConnectionManager
from database.entities import PoolMember


def should_create_a_pool_member_for_user_even_if_user_pool_is_empty(
    mock_track_fetch: MockTrackFetch,
    test_client: TestClient,
    valid_token_header: Headers,
    validate_response: ValidateResponse,
) -> None:
    pool_content_data = mock_track_fetch()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["users"][0]["tracks"]) == 1


def should_propagate_errors_from_spotify_api(
    create_mock_track_search_result: MockTrackSearchResult,
    test_client: TestClient,
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    spotify_error_message: ErrorData,
) -> None:
    track = create_mock_track_search_result()
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    json_data = validate_response(response, 502)
    assert json_data["detail"] == (
        f"Error code {spotify_error_message.code} received while calling Spotify API. "
        f"Message: {spotify_error_message.message}"
    )


def should_save_the_pool_member_to_database_even_if_user_pool_is_empty(
    mock_track_fetch: MockTrackFetch,
    test_client: TestClient,
    valid_token_header: Headers,
    db_connection: ConnectionManager,
    logged_in_user_id: str,
) -> None:
    pool_content_data = mock_track_fetch()

    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = session.scalar(select(PoolMember).where(PoolMember.user_id == logged_in_user_id))
    assert actual_pool_content is not None


def should_preserve_existing_pool_members_on_new_member_addition(
    mock_track_fetch: MockTrackFetch,
    test_client: TestClient,
    valid_token_header: Headers,
    db_connection: ConnectionManager,
    logged_in_user_id: str,
    existing_pool: list[PoolMember],
) -> None:
    pool_content_data = mock_track_fetch()

    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = (
            session.scalars(select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
        )
    assert len(actual_pool_content) == len(existing_pool) + 1


@pytest.mark.usefixtures("existing_pool")
def should_not_allow_adding_same_track_twice_by_same_user(
    create_mock_track_search_result: MockTrackSearchResult,
    requests_client_get_queue: MockResponseQueue,
    build_success_response: BuildSuccessResponse,
    test_client: TestClient,
    valid_token_header: Headers,
    validate_error_response: ValidateErrorResponse,
) -> None:
    track = create_mock_track_search_result()
    requests_client_get_queue.append(build_success_response(track))
    requests_client_get_queue.append(build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()
    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    expected_error_response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)
    validate_error_response(expected_error_response, 400, "Cannot add the same resource twice by the same user!")


def should_allow_adding_same_track_by_different_users(
    create_mock_track_search_result: MockTrackSearchResult,
    requests_client_get_queue: MockResponseQueue,
    build_success_response: BuildSuccessResponse,
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    joined_user_header: Headers,
) -> None:
    track = create_mock_track_search_result()
    requests_client_get_queue.append(build_success_response(track))
    requests_client_get_queue.append(build_success_response(track))
    pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()
    test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    expected_response = test_client.post("/pool/content", json=pool_content_data, headers=joined_user_header)
    validate_model(PoolFullContents, expected_response)


@pytest.mark.usefixtures("existing_pool")
def should_allow_adding_track_that_is_inside_a_collection(
    create_mock_artist_search_result: MockArtistSearchResult,
    create_mock_track_search_result: MockTrackSearchResult,
    create_mock_album_search_result: MockAlbumSearchResult,
    requests_client_get_queue: MockResponseQueue,
    build_success_response: BuildSuccessResponse,
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
) -> None:
    artist = create_mock_artist_search_result()
    track, *rest = (create_mock_track_search_result(artist) for _ in range(10))
    album = create_mock_album_search_result(artist, [track, *rest])
    # track album is popped in mock album fetch method. Add it back...
    track["album"] = create_mock_album_search_result(artist)
    requests_client_get_queue.append(build_success_response(album))
    requests_client_get_queue.append(build_success_response(track))
    track_pool_content_data = PoolContent(spotify_uri=track["uri"]).model_dump()
    album_pool_content_data = PoolContent(spotify_uri=album["uri"]).model_dump()
    test_client.post("/pool/content", json=album_pool_content_data, headers=valid_token_header)

    expected_response = test_client.post("/pool/content", json=track_pool_content_data, headers=valid_token_header)
    validate_model(PoolFullContents, expected_response)


def should_correctly_construct_pool_after_collection_addition(
    mock_playlist_fetch: MockPlaylistFetch,
    test_client: TestClient,
    valid_token_header: Headers,
    db_connection: ConnectionManager,
    logged_in_user_id: str,
    existing_pool: list[PoolMember],
    mocked_pool_contents: MockedPoolContents,
    validate_response: ValidateResponse,
) -> None:
    pool_content_data = mock_playlist_fetch(35)

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    with db_connection.session() as session:
        actual_pool_content = (
            session.scalars(
                select(PoolMember).where(and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))  # noqa: E711
            )
            .unique()
            .all()
        )
    assert len(actual_pool_content) == len(existing_pool) + 1
    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    playlist = mocked_pool_contents.playlist.first_fetch
    assert len(user_pool["collections"][0]["tracks"]) == len(playlist["tracks"]["items"])


@pytest.mark.usefixtures("existing_pool")
def should_use_collection_icon_as_track_icon_on_collection_addition(
    mock_album_fetch: MockAlbumFetch,
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    test_client: TestClient,
    mocked_pool_contents: MockedPoolContents,
) -> None:
    pool_content_data = mock_album_fetch()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    album = mocked_pool_contents.album
    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    for track in user_pool["collections"][0]["tracks"]:
        assert track["spotify_icon_uri"] == album["images"][0]["url"]


def should_include_current_token_in_response_headers(
    test_client: TestClient,
    valid_token_header: Headers,
    assert_token_in_headers: AssertTokenInHeaders,
    mock_track_fetch: MockTrackFetch,
) -> None:
    pool_content_data = mock_track_fetch()

    response = test_client.post("/pool/content", json=pool_content_data, headers=valid_token_header)

    assert_token_in_headers(response)
