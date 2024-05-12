from logging import getLogger

from fastapi import APIRouter

from api.common.dependencies import validated_user
from api.search.dependencies import SearchSpotifyClient
from api.search.models import (
    AlbumSearchResult,
    ArtistSearchResult,
    GeneralSearchResult,
    PlaylistSearchResult,
    SpotifyPlayableType,
    TrackSearchResult,
)

_logger = getLogger("main.api.search.routes")


router = APIRouter(prefix="/search", tags=["search"])


@router.get("/")
async def search(query: str, user: validated_user, spotify_client: SearchSpotifyClient) -> GeneralSearchResult:
    _logger.debug(f"GET /search called with query '{query}' and token '{user}'.")
    all_playable_types = [e.value for e in SpotifyPlayableType]
    return spotify_client.get_general_search(query, user, all_playable_types)


@router.get("/tracks")
async def search_tracks(
    user: validated_user, spotify_client: SearchSpotifyClient, query: str, offset: int = 0, limit: int = 20
) -> TrackSearchResult:
    _logger.debug(
        f"GET /search/tracks called with query '{query}', " f"offset {offset}, limit {limit} and token '{user}'."
    )
    return spotify_client.get_track_search(query, user, offset, limit)


@router.get("/albums")
async def search_albums(
    user: validated_user, spotify_client: SearchSpotifyClient, query: str, offset: int = 0, limit: int = 20
) -> AlbumSearchResult:
    _logger.debug(
        f"GET /search/albums called with query '{query}', " f"offset {offset}, limit {limit} and token '{user}'."
    )
    return spotify_client.get_album_search(query, user, offset, limit)


@router.get("/artists")
async def search_artists(
    user: validated_user, spotify_client: SearchSpotifyClient, query: str, offset: int = 0, limit: int = 20
) -> ArtistSearchResult:
    _logger.debug(
        f"GET /search/artists called with query '{query}', " f"offset {offset}, limit {limit} and token '{user}'."
    )
    return spotify_client.get_artist_search(query, user, offset, limit)


@router.get("/playlists")
async def search_playlists(
    user: validated_user, spotify_client: SearchSpotifyClient, query: str, offset: int = 0, limit: int = 20
) -> PlaylistSearchResult:
    _logger.debug(
        f"GET /search/playlists called with query '{query}', " f"offset {offset}, limit {limit} and token '{user}'."
    )
    return spotify_client.get_playlist_search(query, user, offset, limit)
