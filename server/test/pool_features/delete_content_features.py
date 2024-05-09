from sqlalchemy import select, and_
from starlette.testclient import TestClient

from database.database_connection import ConnectionManager
from database.entities import PoolMember, User
from pool_features.conftest import MockPlaylistFetchResult
from test_types.typed_dictionaries import Headers, PlaylistData
from test_types.callables import ValidateResponse, BuildSuccessResponse, \
    CreatePoolCreationDataJson, AssertTokenInHeaders
from test_types.aliases import MockResponseQueue


def should_delete_track_and_return_remaining_pool_if_given_track_id(existing_pool: list[PoolMember],
                                                                    valid_token_header: Headers,
                                                                    validate_response: ValidateResponse,
                                                                    test_client: TestClient):
    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["users"][0]["tracks"]) == len(existing_pool) - 1


def should_return_self_as_owner_on_deletion(existing_pool: list[PoolMember], valid_token_header: Headers,
                                            validate_response: ValidateResponse, test_client: TestClient,
                                            logged_in_user: User):
    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    pool_response = validate_response(response)
    assert pool_response["owner"]["spotify_id"] == logged_in_user.spotify_id


def should_not_have_track_in_database_after_deletion(existing_pool: list[PoolMember], test_client: TestClient,
                                                     valid_token_header: Headers, logged_in_user_id: User,
                                                     db_connection: ConnectionManager):
    test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)

    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    assert len(all_tracks) == len(existing_pool) - 1


def should_be_able_to_delete_separate_child_from_collection(
        logged_in_user_id: str, db_connection: ConnectionManager, requests_client_get_queue: MockResponseQueue,
        validate_response: ValidateResponse, valid_token_header: Headers, test_client: TestClient,
        create_mock_playlist_fetch_result: MockPlaylistFetchResult,
        create_pool_creation_data_json: CreatePoolCreationDataJson,
        build_success_response: BuildSuccessResponse):
    playlist = create_mock_playlist_fetch_result(15).first_fetch
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    requests_client_get_queue.append(build_success_response(playlist))
    test_client.post("/pool", json=create_pool_creation_data_json(playlist["uri"]), headers=valid_token_header)

    response = test_client.delete(f"/pool/content/{expected_tracks[5]["uri"]}", headers=valid_token_header)
    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["collections"][0]["tracks"]) == len(expected_tracks) - 1
    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(
            and_(PoolMember.parent_id != None, PoolMember.user_id == logged_in_user_id))).unique().all()
    assert len(all_tracks) == len(expected_tracks) - 1
    with db_connection.session() as session:
        parent = session.scalar(select(PoolMember).where(PoolMember.content_uri == playlist["uri"]))
    assert parent is not None


def should_delete_all_children_on_parent_deletion(
        test_client: TestClient, create_mock_playlist_fetch_result: MockPlaylistFetchResult,
        validate_response: ValidateResponse, db_connection: ConnectionManager,
        valid_token_header: Headers, create_pool_creation_data_json: CreatePoolCreationDataJson,
        requests_client_get_queue: MockResponseQueue, logged_in_user_id: str,
        build_success_response: BuildSuccessResponse):
    playlist = create_mock_playlist_fetch_result(15).first_fetch
    requests_client_get_queue.append(build_success_response(playlist))
    test_client.post("/pool", json=create_pool_creation_data_json(playlist["uri"]), headers=valid_token_header)

    response = test_client.delete(f"/pool/content/{playlist["uri"]}", headers=valid_token_header)

    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["collections"]) == 0
    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(
            and_(PoolMember.parent_id != None, PoolMember.user_id == logged_in_user_id))).unique().all()
    assert len(all_tracks) == 0


def should_return_error_if_member_does_not_exist_in_pool(test_client: TestClient, existing_pool: list[PoolMember],
                                                         valid_token_header: Headers,
                                                         validate_response: ValidateResponse):
    response = test_client.delete(f"/pool/content/invalid_content_uri", headers=valid_token_header)

    json_data = validate_response(response, 404)
    assert json_data["detail"] == "Can't delete a pool member that does not exist."


def should_return_error_if_member_is_not_users_own(test_client: TestClient, shared_pool_code: str,
                                                   existing_pool: list[PoolMember],
                                                   validate_response: ValidateResponse,
                                                   another_logged_in_user_header: Headers):
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)

    response = test_client.delete(f"/pool/content/{existing_pool[1].content_uri}",
                                  headers=another_logged_in_user_header)

    json_data = validate_response(response, 400)
    assert json_data["detail"] == "Can't delete a pool member added by another user."


def should_include_token_in_headers(existing_pool: list[PoolMember], valid_token_header: Headers,
                                    test_client: TestClient, assert_token_in_headers: AssertTokenInHeaders):
    response = test_client.delete(f"/pool/content/{existing_pool[0].content_uri}", headers=valid_token_header)
    assert_token_in_headers(response)
