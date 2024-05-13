from typing import Literal, TypedDict

from api.common.spotify_models import ExternalUrlData, TrackData


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
