from dataclasses import dataclass
from enum import Enum
from typing import TypedDict, Literal, Never


class Headers(TypedDict):
    Authorization: str


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
    next: str
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
    track: TrackData


class PlaylistData(SpotifyResourceWithImagesData):
    collaborative: bool
    description: str
    owner: UserData
    public: bool
    snapshot_id: str
    tracks: PaginatedSearchResultData[PlaylistTrackData]
    type: Literal["playlist"]


class SpotifyDeviceData(TypedDict):
    id: str
    name: str
    is_active: bool
    is_private_session: bool
    is_restricted: bool
    volume_percent: int
    supports_volume: bool


class PlaybackActionsData(TypedDict):
    interrupting_playback: bool
    pausing: bool
    resuming: bool
    seeking: bool
    skipping_next: bool
    skipping_prev: bool
    toggling_repeat_context: bool
    toggling_shuffle: bool
    toggling_repeat_track: bool
    transferring_playback: bool


class PlaybackContextData(TypedDict):
    type: Literal["artist", "playlist", "album", "show"]
    href: str
    external_urls: ExternalUrlData
    uri: str


class PlaybackStateData(TypedDict):
    device: SpotifyDeviceData
    repeat_state: Literal["off", "track", "context"]
    shuffle_state: bool
    context: PlaybackContextData | None
    timestamp: int
    progress_ms: int
    is_playing: bool
    item: TrackData
    currently_playing_type: Literal["track", "episode", "unknown"]
    actions: PlaybackActionsData


class QueueData(TypedDict):
    currently_playing: TrackData
    queue: list[TrackData]


class PoolContentData(TypedDict):
    spotify_uri: str


class PoolCreationDataDict(TypedDict):
    spotify_uris: list[PoolContentData]


class GeneralSearchResultData(TypedDict):
    tracks: PaginatedSearchResultData[TrackData]
    albums: PaginatedSearchResultData[AlbumData]
    artists: PaginatedSearchResultData[ArtistData]
    playlists: PaginatedSearchResultData[PlaylistData]
