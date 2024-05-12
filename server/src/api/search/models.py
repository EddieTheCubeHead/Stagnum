from enum import Enum
from typing import Generic, Literal, Never, TypedDict, TypeVar

from pydantic import BaseModel

from api.common.models import NamedResource


class SpotifyPlayableType(Enum):
    Track = "track"
    Album = "album"
    Artist = "artist"
    Playlist = "playlist"


class SpotifyPlayable(NamedResource):
    uri: str  # spotify unique uri: spotify:track:4PTG3Z6ehGkBFwjybzWkR8


class Artist(SpotifyPlayable):
    icon_link: str | None


class Album(SpotifyPlayable):
    artists: list[NamedResource]
    year: int
    icon_link: str | None


class Track(SpotifyPlayable):
    artists: list[NamedResource]
    album: Album
    duration_ms: int


class Playlist(SpotifyPlayable):
    icon_link: str | None


PlayableType = TypeVar("PlayableType", bound=SpotifyPlayable)


class PaginatedSearchResult(BaseModel, Generic[PlayableType]):
    limit: int
    offset: int
    total: int
    self_page_link: str  # You can get paginated result from general search, this is useful in those cases
    next_page_link: str | None
    items: list[PlayableType]


class TrackSearchResult(PaginatedSearchResult[Track]):
    pass


class AlbumSearchResult(PaginatedSearchResult[Album]):
    pass


class ArtistSearchResult(PaginatedSearchResult[Artist]):
    pass


class PlaylistSearchResult(PaginatedSearchResult[Playlist]):
    pass


class GeneralSearchResult(BaseModel):
    tracks: TrackSearchResult
    albums: AlbumSearchResult
    artists: ArtistSearchResult
    playlists: PlaylistSearchResult


class ImageData(TypedDict):
    url: str
    height: int | None
    width: int | None


class ExternalUrlData(TypedDict):
    spotify: str


class SpotifyResourceData(TypedDict):
    external_urls: ExternalUrlData
    href: str
    id: str
    name: str
    uri: str


class SpotifyResourceWithImagesData(SpotifyResourceData):
    images: list[ImageData]


class FollowersData(TypedDict):
    href: str
    total: int


class ExternalIdData(TypedDict):
    isrc: str
    ean: str
    upc: str


class RestrictionData(TypedDict):
    reason: Literal["market", "product", "explicit"]


class ArtistData(SpotifyResourceWithImagesData):
    followers: FollowersData
    genres: list[str]
    popularity: int
    type: Literal["artist"]


class SimplifiedTrackData(SpotifyResourceData):
    artists: list[SpotifyResourceData]
    available_markets: list[str]
    disc_number: int
    duration_ms: int
    explicit: bool
    external_urs: ExternalUrlData
    is_playable: bool
    linked_from: dict[Never]
    restrictions: RestrictionData
    popularity: int
    preview_url: str
    type: Literal["track"]
    track_number: int
    is_local: bool


class PaginatedSearchResultData[ResultType: SpotifyResourceData](TypedDict):
    href: str
    limit: int
    next: str | None
    offset: int
    previous: str | None
    total: int
    items: list[ResultType]


class AlbumData(SpotifyResourceWithImagesData):
    album_type: Literal["album", "single", "compilation"]
    total_tracks: int
    available_markets: list[str]
    release_date: str
    release_date_precision: Literal["year", "month", "day"]
    restrictions: RestrictionData
    type: Literal["album"]
    artists: list[ArtistData]
    tracks: PaginatedSearchResultData[SimplifiedTrackData]


class TrackData(SpotifyResourceData):
    album: AlbumData
    artists: list[ArtistData]
    available_markets: list[str]
    disc_number: int
    duration_ms: int
    explicit: bool
    external_ids: ExternalIdData
    external_urs: ExternalUrlData
    is_playable: bool
    linked_from: dict[Never]
    restrictions: RestrictionData
    popularity: int
    preview_url: str
    track_number: int
    type: Literal["track"]
    is_local: bool


class UserData(SpotifyResourceData):
    followers: FollowersData
    type: Literal["user"]
    display_name: str


class PlaylistTrackData(TypedDict):
    added_at: str
    added_by: UserData
    is_local: bool
    track: TrackData | None


class PlaylistData(SpotifyResourceWithImagesData):
    collaborative: bool
    description: str
    owner: UserData
    public: bool
    snapshot_id: str
    tracks: PaginatedSearchResultData[PlaylistTrackData]
    type: Literal["playlist"]


class GeneralSearchResultData(TypedDict):
    tracks: PaginatedSearchResultData[TrackData]
    albums: PaginatedSearchResultData[AlbumData]
    artists: PaginatedSearchResultData[ArtistData]
    playlists: PaginatedSearchResultData[PlaylistData]
