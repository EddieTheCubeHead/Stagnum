from fastapi import APIRouter

from api.common.dependencies import validated_token, TokenHolder
from api.pool.dependencies import PoolSpotifyClient, PoolDatabaseConnection
from api.pool.helpers import create_pool_return_model
from api.pool.models import PoolCreationData, Pool, PoolContent

router = APIRouter(
    prefix="/pool",
    tags=["pool"]
)


@router.post("/")
async def create_pool(base_collection: PoolCreationData, token: validated_token,
                      spotify_client: PoolSpotifyClient, database_connection: PoolDatabaseConnection,
                      token_holder: TokenHolder) -> Pool:
    pool_content = spotify_client.get_pool_content(token, *base_collection.spotify_uris)
    database_connection.create_pool(pool_content, token_holder.get_user(token))
    return pool_content


@router.get("/")
async def get_pool() -> Pool:
    pass


@router.post("/content")
async def add_content(to_add: PoolContent, token: validated_token, spotify_client: PoolSpotifyClient,
                      database_connection: PoolDatabaseConnection, token_holder: TokenHolder) -> Pool:
    added_content = spotify_client.get_pool_content(token, to_add)
    whole_pool = database_connection.add_to_pool(added_content, token_holder.get_user(token))
    return create_pool_return_model(whole_pool)


@router.delete("/content/{spotify_uri}")
async def delete_content(spotify_uri: str, token: validated_token, database_connection: PoolDatabaseConnection,
                         token_holder: TokenHolder) -> Pool:
    whole_pool = database_connection.delete_from_pool(spotify_uri, token_holder.get_user(token))
    return create_pool_return_model(whole_pool)
