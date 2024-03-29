import random
from logging import getLogger

from api.common.dependencies import SpotifyClient, RequestsClientRaw, TokenHolder, UserDatabaseConnection
from api.pool.dependencies import PoolDatabaseConnection, PoolSpotifyClient, PoolPlaybackService
from database.database_connection import ConnectionManager
from database.entities import PlaybackSession, PoolMember

_logger = getLogger("main.api.pool.tasks")

_connection_manager = ConnectionManager()
_pool_db_connection = PoolDatabaseConnection(_connection_manager)
_pool_spotify_client = PoolSpotifyClient(SpotifyClient(RequestsClientRaw()))
_user_db_connection = UserDatabaseConnection(_connection_manager)
_token_holder = TokenHolder(_user_db_connection)
_pool_playback_service = PoolPlaybackService(_pool_db_connection, _pool_spotify_client, _token_holder)


def queue_next_songs(playback_service: PoolPlaybackService = None):
    _logger.debug("Queueing next songs")
    playback_service = playback_service if playback_service is not None else _pool_playback_service
    playback_service.update_user_playbacks()
