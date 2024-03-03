import random
from logging import getLogger

from api.common.dependencies import SpotifyClient, RequestsClientRaw, TokenHolder
from api.pool.dependencies import PoolDatabaseConnection, PoolSpotifyClient
from database.database_connection import ConnectionManager
from database.entities import PlaybackSession, PoolMember

_logger = getLogger("main.api.pool.tasks")

_pool_db_connection = PoolDatabaseConnection(ConnectionManager())
_pool_spotify_client = PoolSpotifyClient(SpotifyClient(RequestsClientRaw()))
_token_holder = TokenHolder()


def _update_playback(playback: PlaybackSession, db_connection: PoolDatabaseConnection,
                     spotify_client: PoolSpotifyClient, token_holder: TokenHolder):
    user_token = token_holder.get_from_user_id(playback.user_id)
    user = token_holder.get_from_token(user_token)
    playable_tracks = db_connection.get_playable_tracks(user)
    next_song: PoolMember = random.choice(playable_tracks)
    _logger.debug(f"Adding song {next_song.name} to queue for user {user.spotify_username}")
    spotify_client.set_next_song(user_token, next_song.content_uri)
    db_connection.save_playback_status(user, next_song)


def queue_next_songs(db_connection: PoolDatabaseConnection = None, spotify_client: PoolSpotifyClient = None,
                     token_holder: TokenHolder = None):
    _logger.debug("Queueing next songs")
    db_connection = db_connection if db_connection is not None else _pool_db_connection
    spotify_client = spotify_client if spotify_client is not None else _pool_spotify_client
    token_holder = token_holder if token_holder is not None else _token_holder

    active_playbacks = db_connection.get_playbacks_to_update()
    for playback in active_playbacks:
        _logger.info(f"Queueing next song for user {playback.user_id}")
        _update_playback(playback, db_connection, spotify_client, token_holder)
