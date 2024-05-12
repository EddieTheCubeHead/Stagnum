from typing import Literal, Never, TypedDict


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


class PaginatedSearchResultData[ResultType: SpotifyResourceData](TypedDict):
    href: str
    limit: int
    next: str | None
    offset: int
    previous: str | None
    total: int
    items: list[ResultType]


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


class RequestTokenData(TypedDict):
    grant_type: Literal["authorization_code"]
    code: str
    redirect_uri: str


class RefreshTokenData(TypedDict):
    grant_type: Literal["refresh_token"]
    refresh_token: str
