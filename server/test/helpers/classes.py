import datetime
from dataclasses import dataclass, field
from enum import Enum
from typing import override

from _pytest.python_api import ApproxBase
from pydantic import BaseModel

from api.common.dependencies import DateTimeWrapperRaw
from test_types.typed_dictionaries import TrackData, ArtistData, AlbumData, PlaylistData, PaginatedSearchResultData


@dataclass
class ErrorData:
    message: str
    code: int


@dataclass
class CurrentPlaybackData:
    current_track: TrackData | None = None


class SubscriptionType(Enum):
    Premium = "premium"
    Open = "open"
    Free = "free"


class ErrorResponse(BaseModel):
    detail: str


@dataclass
class MockedArtistPoolContent:
    artist: ArtistData
    tracks: list[TrackData] = field(default_factory=list)


@dataclass
class MockedPlaylistPoolContent:
    first_fetch: PlaylistData
    further_fetches: list[PaginatedSearchResultData]


@dataclass
class MockedPoolContents:
    tracks: list[TrackData] = field(default_factory=list)
    artists: list[MockedArtistPoolContent] = field(default_factory=list)
    albums: list[AlbumData] = field(default_factory=list)
    playlists: list[MockedPlaylistPoolContent] = field(default_factory=list)

    @property
    def track(self) -> TrackData:
        assert len(self.tracks) > 0, "Did not find a mocked track"
        return self.tracks[0]

    @property
    def artist(self) -> MockedArtistPoolContent:
        assert len(self.artists) > 0, "Did not find a mocked artist"
        return self.artists[0]

    @property
    def album(self) -> AlbumData:
        assert len(self.albums) > 0, "Did not find a mocked album"
        return self.albums[0]

    @property
    def playlist(self) -> MockedPlaylistPoolContent:
        assert len(self.playlists) > 0, "Did not find a mocked playlist"
        return self.playlists[0]


# "Borrowed" from here: https://github.com/pytest-dev/pytest/issues/8395
class ApproxDatetime(ApproxBase):

    def __init__(self, expected, absolute_tolerance: datetime.timedelta = datetime.timedelta(milliseconds=250)):
        if absolute_tolerance < datetime.timedelta(0):
            raise ValueError(f"absolute tolerance can't be negative: {absolute_tolerance}")
        super().__init__(expected, abs=absolute_tolerance)

    def __repr__(self):
        return f"approx_datetime({self.expected!r} \u00b1 {self.abs!r})"

    def __eq__(self, actual):
        return abs(self.expected - actual) <= self.abs


class MockDateTimeWrapper(DateTimeWrapperRaw):

    def __init__(self):
        super().__init__()
        self._add_to_now: datetime.timedelta = datetime.timedelta(milliseconds=0)

    @override
    def now(self) -> datetime.datetime:
        return datetime.datetime.now(tz=self._timezone) + self._add_to_now

    def increment_now(self, delta: datetime.timedelta) -> None:
        self._add_to_now += delta
