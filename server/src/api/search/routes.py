from fastapi import APIRouter

from api.common.dependencies import validated_token
from api.search.dependencies import SearchSpotifyClient
from api.search.models import GeneralSearchResult, PaginatedSearchResult, Playlist, Artist, Album, Track, \
    SpotifyPlayableType

router = APIRouter(
    prefix="/search",
    tags=["search"]
)


@router.get("/")
async def search(query: str, token: validated_token, spotify_client: SearchSpotifyClient) -> GeneralSearchResult:
    all_playable_types = [e.value for e in SpotifyPlayableType]
    return spotify_client.get_general_search(query, token, all_playable_types)


@router.get("/tracks")
async def search_tracks(token: validated_token, spotify_client: SearchSpotifyClient, query: str, offset: int = 0,
                        limit: int = 20) -> PaginatedSearchResult[Track]:
    return spotify_client.get_track_search(query, token, offset, limit)


@router.get("/albums")
async def search_albums(token: validated_token, spotify_client: SearchSpotifyClient, query: str, offset: int = 0,
                        limit: int = 20) -> PaginatedSearchResult[Album]:
    return spotify_client.get_album_search(query, token, offset, limit)


@router.get("/artists")
async def search_artists(token: validated_token, spotify_client: SearchSpotifyClient, query: str, offset: int = 0,
                         limit: int = 20) -> PaginatedSearchResult[Artist]:
    return spotify_client.get_artist_search(query, token, offset, limit)


@router.get("/playlists")
async def search_playlists(token: validated_token, spotify_client: SearchSpotifyClient, query: str, offset: int = 0,
                           limit: int = 20) -> PaginatedSearchResult[Playlist]:
    return spotify_client.get_playlist_search(query, token, offset, limit)
