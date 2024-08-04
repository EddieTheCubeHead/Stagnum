from logging import getLogger

from database.entities import PoolMember, User
from fastapi import APIRouter

from api.common.dependencies import validated_user
from api.pool.dependencies import PoolDatabaseConnection, PoolPlaybackService, PoolSpotifyClient, WebsocketUpdater
from api.pool.helpers import create_pool_return_model
from api.pool.models import PoolContent, PoolCreationData, PoolFullContents, UnsavedPoolTrack

_logger = getLogger("main.api.pool.routes")

router = APIRouter(prefix="/pool", tags=["pool"])


@router.post("")
async def create_pool(
    base_collection: PoolCreationData,
    user: validated_user,
    spotify_client: PoolSpotifyClient,
    database_connection: PoolDatabaseConnection,
    pool_playback_service: PoolPlaybackService,
) -> PoolFullContents:
    _logger.debug(f"POST /pool called with collection {base_collection} and token {user.session.user_token}")
    unsaved_pool_user_content = spotify_client.get_unsaved_pool_content(user, *base_collection.spotify_uris)
    database_connection.create_pool(unsaved_pool_user_content)
    pool_playback_service.start_playback(user)
    return create_pool_return_model(*database_connection.get_pool_data(user))


@router.get("")
async def get_pool(user: validated_user, database_connection: PoolDatabaseConnection) -> PoolFullContents:
    _logger.debug(f"GET /pool called with token {user}")
    return create_pool_return_model(*database_connection.get_pool_data(user))


@router.post("/content")
async def add_content(
    to_add: PoolContent,
    user: validated_user,
    spotify_client: PoolSpotifyClient,
    database_connection: PoolDatabaseConnection,
    websocket_updater: WebsocketUpdater,
) -> PoolFullContents:
    _logger.debug(f"POST /pool/content called with content {to_add} and token {user.session.user_token}")
    added_content = spotify_client.get_unsaved_pool_content(user, to_add)
    whole_pool = database_connection.add_to_pool(added_content, user)
    return await _create_model_and_update_listeners(database_connection, websocket_updater, user, whole_pool)


@router.delete("/content/{content_id}")
async def delete_content(
    content_id: str,
    user: validated_user,
    database_connection: PoolDatabaseConnection,
    websocket_updater: WebsocketUpdater,
) -> PoolFullContents:
    _logger.debug(f"DELETE /pool/content/{content_id} called with token {user.session.user_token}")
    whole_pool = database_connection.delete_from_pool(content_id, user)
    return await _create_model_and_update_listeners(database_connection, websocket_updater, user, whole_pool)


async def _create_model_and_update_listeners(
    database_connection: PoolDatabaseConnection,
    websocket_updater: WebsocketUpdater,
    user: User,
    whole_pool: list[PoolMember],
) -> PoolFullContents:
    pool_users = database_connection.get_pool_users(user)
    pool = database_connection.get_pool(user)
    code = pool.share_data.code if pool.share_data is not None else None
    current_track = database_connection.get_current_track(user)
    is_playing = database_connection.get_is_playing(pool)
    data_model = create_pool_return_model(whole_pool, pool_users, is_playing, current_track, code)
    user_ids = [user.spotify_id for user in pool_users]
    await websocket_updater.push_update(user_ids, "pool", data_model.model_dump())
    return data_model


@router.post("/playback/skip")
async def skip_song(user: validated_user, pool_playback_service: PoolPlaybackService) -> UnsavedPoolTrack:
    _logger.debug(f"POST /pool/playback/skip called with token {user.session.user_token}")
    return await pool_playback_service.skip_song(user)


@router.post("/playback/pause")
async def pause_playback(user: validated_user, pool_playback_service: PoolPlaybackService) -> PoolFullContents:
    _logger.debug(f"POST /pool/playback/pause called with token {user.session.user_token}")
    return await pool_playback_service.pause_playback(user)


@router.post("/playback/resume")
async def resume_playback(user: validated_user, pool_playback_service: PoolPlaybackService) -> PoolFullContents:
    _logger.debug(f"POST /pool/playback/resume called with token {user.session.user_token}")
    return await pool_playback_service.resume_playback(user)


@router.post("/promote/{track_id}")
async def promote_track(
    user: validated_user,
    track_id: str,
    database_connection: PoolDatabaseConnection,
    websocket_updater: WebsocketUpdater,
) -> PoolFullContents:
    _logger.debug(f"POST /pool/promote/{track_id} called with token {user.session.user_token}")
    whole_pool = database_connection.promote_track(track_id, user)
    return await _create_model_and_update_listeners(database_connection, websocket_updater, user, whole_pool)


@router.post("/depromote")
async def depromote_user(
    user: validated_user, database_connection: PoolDatabaseConnection, websocket_updater: WebsocketUpdater
) -> PoolFullContents:
    _logger.debug(f"POST /pool/depromote called with token {user.session.user_token}")
    whole_pool = database_connection.depromote_track(user)
    return await _create_model_and_update_listeners(database_connection, websocket_updater, user, whole_pool)


@router.post("/share")
async def share_pool(user: validated_user, pool_database_connection: PoolDatabaseConnection) -> PoolFullContents:
    _logger.debug(f"POST /pool/share called with token {user.session.user_token}")
    return create_pool_return_model(*pool_database_connection.share_pool(user))


@router.post("/join/{code}")
async def join_pool(
    code: str,
    user: validated_user,
    pool_websocket_updater: WebsocketUpdater,
    pool_database_connection: PoolDatabaseConnection,
) -> PoolFullContents:
    _logger.debug(f"POST /pool/join called with code {code} and token {user.session.user_token}")
    data_model = create_pool_return_model(*pool_database_connection.join_pool(user, code))
    user_ids = [user.spotify_id for user in pool_database_connection.get_pool_users(user)]
    await pool_websocket_updater.push_update(user_ids, "pool", data_model.model_dump())
    return data_model


@router.delete("")
async def delete_pool(
    user: validated_user,
    pool_database_connection: PoolDatabaseConnection,
    websocket_updater: WebsocketUpdater,
    spotify_client: PoolSpotifyClient,
) -> PoolFullContents:
    pool_users = pool_database_connection.stop_and_purge_playback(user)
    spotify_client.stop_playback(user)
    empty_pool = PoolFullContents(users=[], share_code=None, currently_playing=None, is_active=False)
    await websocket_updater.push_update([user.spotify_id for user in pool_users], "pool", empty_pool.model_dump())
    return empty_pool


@router.post("/leave")
async def leave_pool(
    user: validated_user, pool_database_connection: PoolDatabaseConnection, websocket_updater: WebsocketUpdater
) -> PoolFullContents:
    pool = create_pool_return_model(*pool_database_connection.leave_pool(user))
    await websocket_updater.push_update(
        [user_data.user.spotify_id for user_data in pool.users], "pool", pool.model_dump()
    )
    return PoolFullContents(users=[], share_code=None, currently_playing=None, is_active=False)
