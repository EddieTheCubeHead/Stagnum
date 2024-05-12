from api.pool.models import PoolFullContents
from database.entities import PoolMember, User
from starlette.testclient import TestClient
from test_types.callables import (
    AssertTokenInHeaders,
    CreatePool,
    ValidateErrorResponse,
    ValidateModel,
    ValidateResponse,
)
from test_types.typed_dictionaries import Headers


def should_get_all_existing_tracks(
    existing_pool: list[PoolMember], test_client: TestClient, valid_token_header: Headers, validate_model: ValidateModel,
) -> None:
    response = test_client.get("/pool", headers=valid_token_header)

    user_pool = validate_model(PoolFullContents, response).users[0]
    assert len(user_pool.tracks) == len(existing_pool)


def should_return_mix_of_tracks_and_collections_correctly(
    create_pool: CreatePool, test_client: TestClient, valid_token_header: Headers, validate_model: ValidateModel,
) -> None:
    track_amount = 25
    create_pool(tracks=track_amount, artists=1, albums=[14], playlists=[123])

    response = test_client.get("/pool", headers=valid_token_header)

    user_pool = validate_model(PoolFullContents, response).users[0]
    assert len(user_pool.tracks) == track_amount
    assert len(user_pool.collections) == 3


def should_include_token_in_headers(
    existing_pool: list[PoolMember],
    test_client: TestClient,
    valid_token_header: Headers,
    assert_token_in_headers: AssertTokenInHeaders,
) -> None:
    response = test_client.get("/pool", headers=valid_token_header)
    assert_token_in_headers(response)


def should_return_not_found_if_no_pool_for_user(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_response: ValidateResponse,
    logged_in_user: User,
    validate_error_response: ValidateErrorResponse,
) -> None:
    response = test_client.get("/pool", headers=valid_token_header)

    validate_error_response(response, 404, f"Could not find pool for user {logged_in_user.spotify_username}")


def should_return_self_as_owner(
    existing_pool: list[PoolMember],
    test_client: TestClient,
    logged_in_user: User,
    valid_token_header: Headers,
    validate_model: ValidateModel,
) -> None:
    response = test_client.get("/pool", headers=valid_token_header)

    pool = validate_model(PoolFullContents, response)
    assert pool.owner.spotify_id == logged_in_user.spotify_id
