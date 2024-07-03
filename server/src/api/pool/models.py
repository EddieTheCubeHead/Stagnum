from pydantic import BaseModel

from api.common.models import UserModel


class PoolContent(BaseModel):
    spotify_uri: str


class PoolCreationData(BaseModel):
    spotify_uris: list[PoolContent]


class PoolMember(BaseModel):
    name: str
    spotify_icon_uri: str
    spotify_resource_uri: str


class SavedPoolMember(PoolMember):
    id: int


class PoolTrack(SavedPoolMember):
    duration_ms: int


class PoolCollection(SavedPoolMember):
    tracks: list[PoolTrack]


class UnsavedPoolTrack(PoolMember):
    duration_ms: int


class UnsavedPoolCollection(PoolMember):
    tracks: list[UnsavedPoolTrack]


class PoolUserContents(BaseModel):
    tracks: list[PoolTrack]
    collections: list[PoolCollection]
    user: UserModel


class UnsavedPoolUserContents(BaseModel):
    tracks: list[UnsavedPoolTrack]
    collections: list[UnsavedPoolCollection]
    user: UserModel


class PoolFullContents(BaseModel):
    users: list[PoolUserContents]
    is_active: bool
    currently_playing: UnsavedPoolTrack | None
    share_code: str | None = None
    owner: UserModel | None = None
