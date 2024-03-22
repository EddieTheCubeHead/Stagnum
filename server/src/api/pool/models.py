from pydantic import BaseModel

from api.common.models import UserModel


class PoolContent(BaseModel):
    spotify_uri: str


class PoolCreationData(BaseModel):
    spotify_uris: list[PoolContent]


class PoolTrack(BaseModel):
    name: str
    spotify_icon_uri: str
    spotify_track_uri: str
    duration_ms: int


class PoolCollection(BaseModel):
    name: str
    spotify_icon_uri: str
    spotify_collection_uri: str
    tracks: list[PoolTrack]


class PoolUserContents(BaseModel):
    tracks: list[PoolTrack]
    collections: list[PoolCollection]
    user: UserModel


class PoolFullContents(BaseModel):
    users: list[PoolUserContents]


class SharedPool(BaseModel):
    code: str
