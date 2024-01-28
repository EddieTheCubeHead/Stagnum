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
async def search_tracks(query: str) -> PaginatedSearchResult[Track]:
    pass


@router.get("/albums")
async def search_albums(query: str) -> PaginatedSearchResult[Album]:
    pass


@router.get("/artists")
async def search_artists(query: str) -> PaginatedSearchResult[Artist]:
    pass


@router.get("/playlists")
async def search_playlists(query: str) -> PaginatedSearchResult[Playlist]:
    pass
