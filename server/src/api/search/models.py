from enum import Enum
from typing import Generic, TypeVar

from pydantic import BaseModel
from pydantic.generics import GenericModel

from api.common.models import NamedResource


class SpotifyPlayableType(Enum):
    Track = "track"
    Album = "album"
    Artist = "artist"
    Playlist = "playlist"


class SpotifyPlayable(BaseModel):
    name: str
    uri: str  # spotify unique uri: spotify:track:4PTG3Z6ehGkBFwjybzWkR8


class Track(SpotifyPlayable):
    artists: list[NamedResource]
    album: NamedResource
    duration_ms: int


class Album(SpotifyPlayable):
    artists: list[NamedResource]
    year: int
    icon_link: str


class Artist(SpotifyPlayable):
    icon_link: str


class Playlist(SpotifyPlayable):
    icon_link: str


PlayableType = TypeVar("PlayableType", bound=SpotifyPlayable)


class PaginatedSearchResult(GenericModel, Generic[PlayableType]):
    limit: int
    offset: int
    total: int
    self_page_link: str  # You can get paginated result from general search, this is useful in those cases
    next_page_link: str
    results: list[PlayableType]


class GeneralSearchResult(BaseModel):
    tracks: PaginatedSearchResult[Track]
    albums: PaginatedSearchResult[Album]
    artists: PaginatedSearchResult[Artist]
    playlists: PaginatedSearchResult[Playlist]
