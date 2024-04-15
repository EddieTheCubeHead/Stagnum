from logging import getLogger

from fastapi import APIRouter, WebSocket
from starlette.websockets import WebSocketDisconnect

from api.common.dependencies import validated_user, validated_user_from_query_parameters
from api.pool.dependencies import PoolSpotifyClient, PoolDatabaseConnection, PoolPlaybackService, PoolWebsocketUpdater, \
    PlaybackWebsocketUpdater
from api.pool.helpers import create_pool_return_model
from api.pool.models import PoolCreationData, PoolFullContents, PoolContent, PoolTrack
from database.entities import User, PoolMember

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
    current_track = pool_playback_service.start_playback(user)
    return PoolFullContents(users=[pool_user_content], currently_playing=current_track)


@router.get("/")
async def get_pool(user: validated_user, database_connection: PoolDatabaseConnection) -> PoolFullContents:
    _logger.debug(f"GET /pool called with token {user}")
    return create_pool_return_model(*database_connection.get_pool_data(user))


@router.post("/content")
async def add_content(to_add: PoolContent, user: validated_user, spotify_client: PoolSpotifyClient,
                      database_connection: PoolDatabaseConnection,
                      pool_websocket_updater: PoolWebsocketUpdater) -> PoolFullContents:
    _logger.debug(f"POST /pool/content called with content {to_add} and token {user.session.user_token}")
    added_content = spotify_client.get_pool_content(user, to_add)
    whole_pool = database_connection.add_to_pool(added_content, user)
    data_model = await _create_model_and_update_listeners(database_connection, pool_websocket_updater, user, whole_pool)
    return data_model


@router.delete("/content/{spotify_uri}")
async def delete_content(spotify_uri: str, user: validated_user, database_connection: PoolDatabaseConnection,
                         pool_websocket_updater: PoolWebsocketUpdater) -> PoolFullContents:
    _logger.debug(f"DELETE /pool/content/{spotify_uri} called with token {user.session.user_token}")
    whole_pool = database_connection.delete_from_pool(spotify_uri, user)
    data_model = await _create_model_and_update_listeners(database_connection, pool_websocket_updater, user, whole_pool)
    return data_model


async def _create_model_and_update_listeners(database_connection: PoolDatabaseConnection,
                                             pool_websocket_updater: PoolWebsocketUpdater, user: User,
                                             whole_pool: list[PoolMember]):
    pool_users = database_connection.get_pool_users(user)
    pool = database_connection.get_pool(user)
    code = pool.share_data.code if pool.share_data is not None else None
    current_track = database_connection.get_current_track(user)
    data_model = create_pool_return_model(whole_pool, pool_users, current_track, code)
    await pool_websocket_updater.pool_updated(data_model, pool.id)
    return data_model


@router.post("/playback/skip")
async def skip_song(user: validated_user, pool_playback_service: PoolPlaybackService) -> PoolTrack:
    _logger.debug(f"POST /pool/playback/skip called with token {user.session.user_token}")
    return await pool_playback_service.skip_song(user)


@router.post("/share")
async def share_pool(user: validated_user, pool_database_connection: PoolDatabaseConnection) -> PoolFullContents:
    _logger.debug(f"POST /pool/share called with token {user.session.user_token}")
    return create_pool_return_model(*pool_database_connection.share_pool(user))


@router.post("/join/{code}")
async def join_pool(code: str, user: validated_user, pool_websocket_updater: PoolWebsocketUpdater,
                    pool_database_connection: PoolDatabaseConnection) -> PoolFullContents:
    _logger.debug(f"POST /pool/join called with code {code} and token {user.session.user_token}")
    data_model = create_pool_return_model(*pool_database_connection.join_pool(user, code))
    pool = pool_database_connection.get_pool(user)
    await pool_websocket_updater.pool_updated(data_model, pool.id)
    return data_model


@router.websocket("/register_listener")
async def register_for_pool_updates(websocket: WebSocket, user: validated_user_from_query_parameters,
                                    pool_database_connection: PoolDatabaseConnection,
                                    pool_websocket_updater: PoolWebsocketUpdater):
    await websocket.accept()
    pool = pool_database_connection.get_pool(user)
    pool_websocket_updater.add_socket(websocket, pool)
    try:
        while True:
            await websocket.receive_json()
    except WebSocketDisconnect:
        _logger.info("Socket disconnected")


@router.websocket("/playback/register_listener")
async def register_for_playback_updates(websocket: WebSocket, user: validated_user_from_query_parameters,
                                        pool_database_connection: PoolDatabaseConnection,
                                        playback_websocket_updater: PlaybackWebsocketUpdater):
    await websocket.accept()
    playback_pool = pool_database_connection.get_pool(user)
    playback_websocket_updater.add_socket(websocket, playback_pool)
    try:
        while True:
            await websocket.receive_json()
    except WebSocketDisconnect:
        _logger.info("Socket disconnected")
