from typing import TypedDict


class Headers(TypedDict):
    Authorization: str


class PoolContentData(TypedDict):
    spotify_uri: str


class PoolCreationDataDict(TypedDict):
    spotify_uris: list[PoolContentData]
