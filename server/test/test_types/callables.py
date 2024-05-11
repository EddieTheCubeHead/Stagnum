import datetime
from typing import Protocol, Any, Callable, Awaitable, Union, Tuple

import httpx
from pydantic import BaseModel

from api.common.models import ParsedTokenResponse
from database.entities import User, PoolMember
from helpers.classes import MockedPlaylistPoolContent
from test_types.typed_dictionaries import Headers, TrackData, ArtistData, AlbumData, PlaylistData, PlaybackContextData, \
    PlaybackStateData, QueueData, PoolCreationDataDict, PoolContentData, PaginatedSearchResultData, \
    GeneralSearchResultData, ImageData, SpotifyFetchMeData


class ValidateResponse(Protocol):
    def __call__(self, response: httpx.Response, code: int = ..., /) -> dict[str, Any] | None:
        ...


class MockAlbumSearchResult(Protocol):
    def __call__(self, artist: ArtistData, tracks: list[TrackData] | None = ...) -> AlbumData:
        ...


class MockTrackSearchResult(Protocol):
    def __call__(self, artist_in: ArtistData | None = ..., /) -> TrackData:
        ...


class MockPlaylistSearchResult(Protocol):
    def __call__(self, tracks: list[TrackData] | None = ..., /) -> PlaylistData:
        ...


class IncrementNow(Protocol):
    def __call__(self, increment: datetime.timedelta) -> None:
        ...


class MockTokenReturn(Protocol):
    def __call__(self, token: str = ..., expires_in: int = ..., refresh_token: str = ...) -> httpx.Response:
        ...


class ValidateModel(Protocol):
    def __call__[T: type(BaseModel)](self, expected_type: T, response: httpx.Response) -> T:
        ...


class BaseAuthCallback(Protocol):
    def __call__(self, state: str = ...) -> httpx.Response:
        ...


class CreateSpotifyPlaybackState(Protocol):
    def __call__(self, song_data: TrackData, playback_left: int = ..., is_playing: bool = ...,
                 context: PlaybackContextData | None = ...) -> PlaybackStateData:
        ...


class CreateSpotifyPlayback(Protocol):
    def __call__(self, playback_left_ms: int = ..., songs_in_queue: int | None = ..., song_data: TrackData | None = ...,
                 context: PlaybackContextData | None = ...) -> datetime.datetime:
        ...


class MockPlaylistFetchResult(Protocol):
    def __call__(self, track_amount: int, append_none: bool = ...) -> MockedPlaylistPoolContent:
        ...


class CreatePoolCreationDataJson(Protocol):
    def __call__(self, *uris: str) -> PoolCreationDataDict:
        ...


class CreatePoolFromUsers(Protocol):
    def __call__(self, *user_size_pairs: (User, int)) -> dict[str, list[PoolMember]]:
        ...


class ValidatePaginatedResultLength(Protocol):
    def __call__(self, result: PaginatedSearchResultData, length: int = ..., offset: int = ...) -> None:
        ...


class CreatePaginatedSearchResult(Protocol):
    def __call__[T](self, query: str, limit: int, items: list[T]) -> PaginatedSearchResultData[T]:
        ...


class CreateSearchResponse(Protocol):
    def __call__(self, query: str, limit: int = 20) -> httpx.Response:
        ...


class RunSearch(Protocol):
    def __call__(self, query: str, limit: int = 20) -> httpx.Response:
        ...


class CreateGeneralSearch(Protocol):
    def __call__(self, query: str, limit: int = 20) -> GeneralSearchResultData:
        ...


class RunSearchCall(Protocol):
    def __call__(self, query_addition: str | None, search_call: CreateSearchResponse, query: str,
                 limit: int = 20) -> httpx.Response:
        ...


class CreateSearchResponseFromImages(Protocol):
    def __call__(self, query: str, limit: int = 20, images: list[ImageData] | None = ...) -> httpx.Response:
        ...


class RunGeneralSearchWithCustomImages(Protocol):
    def __call__(self, query: str, limit: int = 20, images: list[ImageData] | None = ...) -> httpx.Response:
        ...


class CreateSpotifyFetchMeData(Protocol):
    def __call__(self, country: str = ..., display_name: str = ..., user_id: str = ...,
                 images: list[ImageData] | None = ..., product: str = ...) -> SpotifyFetchMeData:
        ...


class MockSpotifyUserDataFetch(Protocol):
    def __call__(self, country: str = ..., display_name: str = ..., user_id: str = ...,
                 images: list[ImageData] | None = ..., product: str = ...) -> httpx.Response:
        ...


class MockTrackFetch(Protocol):
    def __call__(self, artist_in: ArtistData | None = ...) -> PoolContentData:
        ...


class MockAlbumFetch(Protocol):
    def __call__(self, album_length: int = ...) -> PoolContentData:
        ...


class MockPlaylistFetch(Protocol):
    def __call__(self, playlist_length: int = ..., append_none: bool = ...) -> PoolContentData:
        ...


class MockPoolContentFetches(Protocol):
    def __call__(self, tracks: int = ..., artists: int = ..., albums: list[int] | None = ...,
                 playlists: list[int] | None = ...) -> PoolCreationDataDict:
        ...


type CreateToken = Callable[[], ParsedTokenResponse]
type LogUserIn = Callable[[User, ParsedTokenResponse], None]
type CreateHeaderFromTokenResponse = Callable[[ParsedTokenResponse], Headers]
type BuildSuccessResponse = Callable[[dict], httpx.Response]
type MockArtistSearchResult = Callable[[], ArtistData]
type GetQueryParameter = Callable[[str, str], str]
type CreateValidStateString = Callable[[], str]
type BaseAuthLogin = Callable[[], httpx.Response]
type SkipSong = Callable[[Headers], httpx.Response]
type SharePoolAndGetCode = Callable[[], str]
type CreateTestUsers = Callable[[int], list[User]]
type MockPoolMemberSpotifyFetch = Callable[[PoolMember], None]
type CreateMemberPostData = Callable[[PoolMember], PoolContentData]
type AddTrackToPool = Callable[[PoolMember, Headers], None]
type ImplementPoolFromMembers = Callable[[list[User], dict[str, list[PoolMember]]], None]
type BuildQueue = Callable[[], QueueData]
type AssertTokenInHeaders = Callable[[httpx.Response], str]
type MockNoPlayerStateResponse = Callable[[], None]
type MockPlaybackPausedResponse = Callable[[], None]
type MockDefaultMeReturn = Callable[[], None]
type RunSchedulingJob = Callable[[], Awaitable[None]]
type ValidateErrorResponse = Callable[[httpx.Response, int, str], None]
type AuthTestCallable = Callable[[str], User]
type MockArtistFetch = Callable[[], PoolContentData]
type MockPutResponse = Callable[[], None]
