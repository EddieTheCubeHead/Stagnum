import pytest
from sqlalchemy import and_, select
from starlette.testclient import TestClient
from test_types.callables import AssertTokenInHeaders, CreatePool, GetExistingPool, ValidateResponse
from test_types.typed_dictionaries import Headers

from database.database_connection import ConnectionManager
from database.entities import PoolMember, User


def should_delete_track_and_return_remaining_pool_if_given_track_id(
    existing_pool: list[PoolMember],
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    test_client: TestClient,
) -> None:
    response = test_client.delete(f"/pool/content/{existing_pool[0].id}", headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["users"][0]["tracks"]) == len(existing_pool) - 1


def should_return_self_as_owner_on_deletion(
    existing_pool: list[PoolMember],
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    test_client: TestClient,
    logged_in_user: User,
) -> None:
    response = test_client.delete(f"/pool/content/{existing_pool[0].id}", headers=valid_token_header)

    pool_response = validate_response(response)
    assert pool_response["owner"]["spotify_id"] == logged_in_user.spotify_id


def should_not_have_track_in_database_after_deletion(
    existing_pool: list[PoolMember],
    test_client: TestClient,
    valid_token_header: Headers,
    logged_in_user_id: User,
    db_connection: ConnectionManager,
) -> None:
    test_client.delete(f"/pool/content/{existing_pool[0].id}", headers=valid_token_header)

    with db_connection.session() as session:
        all_tracks = session.scalars(select(PoolMember).where(PoolMember.user_id == logged_in_user_id)).unique().all()
    assert len(all_tracks) == len(existing_pool) - 1


def should_be_able_to_delete_separate_child_from_collection(
    create_pool: CreatePool,
    get_existing_pool: GetExistingPool,
    logged_in_user_id: str,
    db_connection: ConnectionManager,
    validate_response: ValidateResponse,
    valid_token_header: Headers,
    test_client: TestClient,
) -> None:
    create_pool(playlists=[15])
    pool = get_existing_pool()
    expected_tracks = pool.users[0].collections[0].tracks

    response = test_client.delete(f"/pool/content/{expected_tracks[5].id}", headers=valid_token_header)

    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["collections"][0]["tracks"]) == len(expected_tracks) - 1
    with db_connection.session() as session:
        all_tracks = (
            session.scalars(
                select(PoolMember).where(and_(PoolMember.parent_id != None, PoolMember.user_id == logged_in_user_id))  # noqa: E711
            )
            .unique()
            .all()
        )
    assert len(all_tracks) == len(expected_tracks) - 1
    with db_connection.session() as session:
        parent = session.scalar(select(PoolMember).where(PoolMember.id == pool.users[0].collections[0].id))
    assert parent is not None


def should_delete_all_children_on_parent_deletion(
    test_client: TestClient,
    validate_response: ValidateResponse,
    db_connection: ConnectionManager,
    valid_token_header: Headers,
    logged_in_user_id: str,
    create_pool: CreatePool,
    get_existing_pool: GetExistingPool,
) -> None:
    create_pool(playlists=[15])
    pool = get_existing_pool()
    playlist = pool.users[0].collections[0]

    response = test_client.delete(f"/pool/content/{playlist.id}", headers=valid_token_header)

    pool_response = validate_response(response)
    user_pool = pool_response["users"][0]
    assert len(user_pool["collections"]) == 0
    with db_connection.session() as session:
        all_tracks = (
            session.scalars(
                select(PoolMember).where(
                    and_(PoolMember.parent_id is not None, PoolMember.user_id == logged_in_user_id)
                )
            )
            .unique()
            .all()
        )
    assert len(all_tracks) == 0


@pytest.mark.usefixtures("existing_pool")
def should_return_error_if_member_does_not_exist_in_pool(
    test_client: TestClient, valid_token_header: Headers, validate_response: ValidateResponse
) -> None:
    response = test_client.delete("/pool/content/31415", headers=valid_token_header)

    json_data = validate_response(response, 404)
    assert json_data["detail"] == "Can't delete a pool member that does not exist."


@pytest.mark.usefixtures("existing_pool")
def should_return_error_if_member_is_not_users_own(
    test_client: TestClient,
    get_existing_pool: GetExistingPool,
    validate_response: ValidateResponse,
    joined_user_header: Headers,
) -> None:
    existing_pool = get_existing_pool()
    response = test_client.delete(f"/pool/content/{existing_pool.users[0].tracks[0].id}", headers=joined_user_header)

    json_data = validate_response(response, 400)
    assert json_data["detail"] == "Can't delete a pool member added by another user."


@pytest.mark.usefixtures("existing_pool")
def should_include_token_in_headers(
    get_existing_pool: GetExistingPool,
    valid_token_header: Headers,
    test_client: TestClient,
    assert_token_in_headers: AssertTokenInHeaders,
) -> None:
    existing_pool = get_existing_pool()
    response = test_client.delete(f"/pool/content/{existing_pool.users[0].tracks[0].id}", headers=valid_token_header)
    assert_token_in_headers(response)
