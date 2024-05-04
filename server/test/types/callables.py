import datetime
from typing import Protocol, Any, Callable, Awaitable, Union, Tuple

import httpx
from pydantic import BaseModel

from api.common.models import ParsedTokenResponse
from database.entities import User
from types.typed_dictionaries import Headers, TrackData, ArtistData, AlbumData, PlaylistData, PlaybackContextData, \
    PlaybackStateData, QueueData


class _ValidateResponseProtocol(Protocol):
    def __call__(self, response: httpx.Response, code: int = ..., /) -> dict[str, Any] | None:
        ...

type validate_response_callable = _ValidateResponseProtocol


class _MockAlbumSearchResultProtocol(Protocol):
    def __call__(self, artist: ArtistData, tracks: list[TrackData] | None = ...) -> AlbumData:
        ...

type mock_album_search_result_callable = _MockAlbumSearchResultProtocol


class _MockTrackSearchResultProtocol(Protocol):
    def __call__(self, artist_in: ArtistData | None = ..., /) -> TrackData:
        ...

type mock_track_search_result_callable = _MockTrackSearchResultProtocol


class _MockPlaylistSearchResultProtocol(Protocol):
    def __call__(self, tracks: list[TrackData] | None = ..., /) -> PlaylistData:
        ...

type mock_playlist_search_result_callable = _MockPlaylistSearchResultProtocol


class _IncrementNowProtocol(Protocol):
    def __call__(self, increment: datetime.timedelta) -> None:
        ...

type increment_now_callable = _IncrementNowProtocol


class _MockTokenReturnProtocol(Protocol):
    def __call__(self, token: str = ..., expires_in: int = ..., refresh_token: str = ...) -> httpx.Response:
        ...

type mock_token_return_callable = _MockTokenReturnProtocol


class _ValidateModelCallableProtocol(Protocol):
    def __call__[T: type(BaseModel)](self, expected_type: T, response: httpx.Response) -> T:
        ...

type validate_model_callable = _ValidateModelCallableProtocol


class _BaseAuthCallbackProtocol(Protocol):
    def __call__(self, state: str = ...) -> httpx.Response:
        ...

type base_auth_callback_callable = _BaseAuthCallbackProtocol


class _CreateSpotifyPlaybackStateProtocol(Protocol):
    def __call__(self, song_data: TrackData, playback_left: int = ..., is_playing: bool = ...,
                 context: PlaybackContextData | None = ...) -> PlaybackStateData:
        ...

type create_spotify_playback_state_callable = _CreateSpotifyPlaybackStateProtocol


class _CreateSpotifyPlaybackProtocol(Protocol):
    def __call__(self, playback_left_ms: int = ..., songs_in_queue: int | None = ..., song_data: TrackData | None = ...,
                 context: PlaybackContextData | None = ...) -> datetime.datetime:
        ...

type create_spotify_playback_callable = _CreateSpotifyPlaybackProtocol


class _MockPlaylistFetchResultProtocol(Protocol):
    def __call__(self, track_amount: int, append_none: bool = ...) -> Union[PlaylistData, Tuple[PlaylistData, ...]]:
        ...

type mock_playlist_fetch_result_callable = _MockPlaylistFetchResultProtocol


type create_token_callable = Callable[[], ParsedTokenResponse]
type log_user_in_callable = Callable[[User, ParsedTokenResponse], None]
type create_header_from_token_response_callable = Callable[[ParsedTokenResponse], Headers]
type build_success_response_callable = Callable[[dict], httpx.Response]
type mock_artist_search_result_callable = Callable[[], ArtistData]
type get_query_parameter_callable = Callable[[str, str], str]
type create_pool_creation_data_json_callable = Callable[[(str, ...)], dict[str, Any]]
type create_valid_state_string_callable = Callable[[], str]
type base_auth_login_callable = Callable[[], httpx.Response]
type skip_song_callable = Callable[[dict], httpx.Response]
type mock_filled_queue_get_callable = Callable[[], dict[str, Any]]
type share_pool_and_get_code_callable = Callable[[], str]
type BuildQueue = Callable[[], QueueData]
type mock_no_player_state_response_callable = Callable[[], None]
type mock_playback_paused_response_callable = Callable[[], None]
type run_scheduling_job_awaitable = Callable[[], Awaitable[None]]