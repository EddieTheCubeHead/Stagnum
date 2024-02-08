from fastapi import APIRouter

from api.common.dependencies import validated_token, SpotifyClient
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
    return spotify_client.get_search(query, token, all_playable_types)


@router.get("/tracks")
async def search_tracks(query: str, limit: int = 20, offset: int = 0) -> PaginatedSearchResult[Track]:
    pass


@router.get("/albums")
async def search_albums(query: str, limit: int = 20, offset: int = 0) -> PaginatedSearchResult[Album]:
    pass


@router.get("/artists")
async def search_artists(query: str, limit: int = 20, offset: int = 0) -> PaginatedSearchResult[Artist]:
    pass


@router.get("/playlists")
async def search_playlists(query: str, limit: int = 20, offset: int = 0) -> PaginatedSearchResult[Playlist]:
    pass
