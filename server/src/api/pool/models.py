from pydantic import BaseModel


class PoolCreationData(BaseModel):
    spotify_uris: list[str]


class PoolTrack(BaseModel):
    name: str
    spotify_icon_uri: str
    spotify_track_uri: str


class PoolCollection(BaseModel):
    name: str
    spotify_icon_uri: str
    tracks: list[PoolTrack]


class Pool(BaseModel):
    tracks: list[PoolTrack]
    collections: list[PoolCollection]
