from logging import getLogger

from fastapi import APIRouter

from api.common.dependencies import validated_user, TokenHolder
from api.pool.dependencies import PoolSpotifyClient, PoolDatabaseConnection, PoolPlaybackService
from api.pool.helpers import create_pool_return_model
from api.pool.models import PoolCreationData, PoolFullContents, PoolContent, PoolTrack

_logger = getLogger("main.api.pool.routes")

router = APIRouter(
    prefix="/pool",
    tags=["pool"]
)


@router.post("/")
async def create_pool(base_collection: PoolCreationData, user: validated_user,
                      spotify_client: PoolSpotifyClient, database_connection: PoolDatabaseConnection,
                      pool_playback_service: PoolPlaybackService) -> PoolFullContents:
    _logger.debug(f"POST /pool called with collection {base_collection} and token {user.session.user_token}")
    pool_user_content = spotify_client.get_pool_content(user, *base_collection.spotify_uris)
    database_connection.create_pool(pool_user_content)
    pool_playback_service.start_playback(user)
    return PoolFullContents(users=[pool_user_content])


@router.get("/")
async def get_pool(user: validated_user, database_connection: PoolDatabaseConnection) -> PoolFullContents:
    _logger.debug(f"GET /pool called with token {user}")
    pool, users = database_connection.get_pool(user)
    return create_pool_return_model(pool, users)


@router.post("/content")
async def add_content(to_add: PoolContent, user: validated_user, spotify_client: PoolSpotifyClient,
                      database_connection: PoolDatabaseConnection, token_holder: TokenHolder) -> PoolFullContents:
    _logger.debug(f"POST /pool/content called with content {to_add} and token {user.session.user_token}")
    added_content = spotify_client.get_pool_content(user, to_add)
    whole_pool = database_connection.add_to_pool(added_content, user)
    pool_users = database_connection.get_pool_users(user)
    return create_pool_return_model(whole_pool, pool_users)


@router.delete("/content/{spotify_uri}")
async def delete_content(spotify_uri: str, user: validated_user, database_connection: PoolDatabaseConnection,
                         token_holder: TokenHolder) -> PoolFullContents:
    _logger.debug(
        f"DELETE /pool/content/{{spotify_uri}} called with uri {spotify_uri} and token {user.session.user_token}")
    whole_pool = database_connection.delete_from_pool(spotify_uri, user)
    pool_users = database_connection.get_pool_users(user)
    return create_pool_return_model(whole_pool, pool_users)


@router.post("/playback/skip")
async def skip_song(user: validated_user, pool_playback_service: PoolPlaybackService) -> PoolTrack:
    _logger.debug(f"POST /pool/playback/skip called with token {user.session.user_token}")
    return pool_playback_service.skip_song(user)


@router.post("/share")
async def share_pool(user: validated_user, database_connection: PoolDatabaseConnection) -> PoolFullContents:
    _logger.debug(f"POST /pool/share called with token {user}")
    return create_pool_return_model(*database_connection.share_pool(user))
