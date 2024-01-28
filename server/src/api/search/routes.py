from fastapi import APIRouter

from api.search.models import GeneralSearchResult, PaginatedSearchResult, Playlist, Artist, Album, Track

router = APIRouter(
    prefix="/search",
    tags=["search"]
)


@router.get("/")
async def search(query: str) -> GeneralSearchResult:
    pass


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
