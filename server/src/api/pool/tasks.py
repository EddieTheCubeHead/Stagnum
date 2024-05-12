from logging import getLogger

from database.database_connection import ConnectionManager

from api.common.dependencies import (
    AuthSpotifyClient,
    DateTimeWrapper,
    RequestsClientRaw,
    SpotifyClient,
    TokenHolder,
    UserDatabaseConnection,
)
from api.pool.dependencies import PoolDatabaseConnection, PoolPlaybackService, PoolSpotifyClient, WebsocketUpdater
from api.pool.randomization_algorithms import NextSongProvider

_logger = getLogger("main.api.pool.tasks")

_datetime_wrapper = DateTimeWrapper()
_requests_client = RequestsClientRaw()
_spotify_client = SpotifyClient(_requests_client)
_connection_manager = ConnectionManager()
_pool_db_connection = PoolDatabaseConnection(_connection_manager, _datetime_wrapper)
_pool_spotify_client = PoolSpotifyClient(_spotify_client)
_user_db_connection = UserDatabaseConnection(_connection_manager, _datetime_wrapper)
_auth_spotify_client = AuthSpotifyClient(_spotify_client)
_token_holder = TokenHolder(_user_db_connection, _auth_spotify_client, _datetime_wrapper, None)
_next_song_provider = NextSongProvider()
_playback_updater = WebsocketUpdater()
_pool_playback_service = PoolPlaybackService(_pool_db_connection, _pool_spotify_client, _token_holder,
                                             _next_song_provider, _datetime_wrapper, _playback_updater)


async def queue_next_songs(playback_service: PoolPlaybackService = None) -> None:
    _logger.debug("Queueing next songs")
    playback_service = playback_service if playback_service is not None else _pool_playback_service
    await playback_service.update_user_playbacks()
