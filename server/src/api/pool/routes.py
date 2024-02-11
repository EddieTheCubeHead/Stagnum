from fastapi import APIRouter

from api.common.dependencies import validated_token, TokenHolder
from api.pool.dependencies import PoolSpotifyClient, PoolDatabaseConnection
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
    database_connection.save_pool(pool_content, token_holder.get_user(token))
    return pool_content


@router.get("/")
async def get_pool() -> Pool:
    pass


@router.post("/content")
async def add_content(to_add: PoolContent) -> Pool:
    pass


@router.delete("/content")
async def delete_content(to_delete: PoolContent) -> Pool:
    pass
