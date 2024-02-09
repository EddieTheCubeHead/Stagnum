import datetime
import json
from typing import Annotated, Callable

from fastapi import Depends

from api.common.dependencies import SpotifyClient
from api.common.models import NamedResource
from api.search.models import Track, Album, Artist, Playlist, PaginatedSearchResult, GeneralSearchResult, \
    SpotifyPlayableType


def _get_sharpest_icon(icons: list[dict]) -> str:
    max_size = icons[0]["height"] if icons[0]["height"] is not None else 0
    biggest_icon = icons[0]["url"]
    for icon in icons:
        if (icon["height"] or 0) > max_size:
            max_size = icon["height"]
            biggest_icon = icon["url"]
    return biggest_icon


def _build_track(track_data: dict) -> Track:
    return Track(
        artists=[NamedResource(name=artist["name"], link=artist["href"]) for artist in track_data["artists"]],
        album=NamedResource(name=track_data["album"]["name"], link=track_data["album"]["href"]),
        duration_ms=track_data["duration_ms"],
        name=track_data["name"],
        uri=track_data["uri"]
    )


def _build_album(album_data: dict) -> Album:
    return Album(
        artists=[NamedResource(name=artist["name"], link=artist["href"]) for artist in album_data["artists"]],
        year=int(album_data["release_date"][:4]),
        icon_link=_get_sharpest_icon(album_data["images"]),
        name=album_data["name"],
        uri=album_data["uri"]
    )


def _build_artist(artist_data: dict) -> Artist:
    return Artist(
        name=artist_data["name"],
        uri=artist_data["uri"],
        icon_link=_get_sharpest_icon(artist_data["images"])
    )


def _build_playlist(playlist_data: dict) -> Playlist:
    return Playlist(
        name=playlist_data["name"],
        uri=playlist_data["uri"],
        icon_link=_get_sharpest_icon(playlist_data["images"])
    )


def _build_paginated_result(result_data, builder_function: Callable) -> PaginatedSearchResult:
    return PaginatedSearchResult(
        limit=result_data["limit"],
        offset=result_data["offset"],
        total=result_data["total"],
        results=[builder_function(item) for item in result_data["items"]],
        self_page_link=result_data["href"],
        next_page_link=result_data["next"]
    )


def _auth_header(token: str) -> dict:
    return {
        "Authorization": token
    }


class SearchSpotifyClientRaw:
    def __init__(self, spotify_client: SpotifyClient):
        self._spotify_client = spotify_client

    def get_general_search(self, query: str, token: str, types: list[str]) \
            -> GeneralSearchResult:
        result = self._get_search(query, token, types)
        artist_result = _build_paginated_result(result["artists"], _build_artist)
        album_result = _build_paginated_result(result["albums"], _build_album)
        tracks_result = _build_paginated_result(result["tracks"], _build_track)
        playlists_result = _build_paginated_result(result["playlists"], _build_playlist)
        return GeneralSearchResult(tracks=tracks_result, artists=artist_result, albums=album_result,
                                   playlists=playlists_result)

    def _get_search(self, query: str, token: str, types: list[str], offset: int = 0, limit: int = 20) -> dict:
        search_types = ",".join(types)
        headers = _auth_header(token)
        query_string = f"search?q={query}&type={search_types}&offset={offset}&limit={limit}"
        raw_result = self._spotify_client.get(query_string, headers=headers)
        return json.loads(raw_result.content.decode("utf8"))

    def get_track_search(self, query: str, token: str, offset: int = 0, limit: int = 20) \
            -> PaginatedSearchResult[Track]:
        result = self._get_search(query, token, [SpotifyPlayableType.Track.value], offset, limit)
        return _build_paginated_result(result["tracks"], _build_track)

    def get_album_search(self, query: str, token: str, offset: int = 0, limit: int = 20) \
            -> PaginatedSearchResult[Album]:
        result = self._get_search(query, token, [SpotifyPlayableType.Album.value], offset, limit)
        return _build_paginated_result(result["albums"], _build_album)

    def get_artist_search(self, query: str, token: str, offset: int = 0, limit: int = 20) \
            -> PaginatedSearchResult[Artist]:
        result = self._get_search(query, token, [SpotifyPlayableType.Artist.value], offset, limit)
        return _build_paginated_result(result["artists"], _build_artist)

    def get_playlist_search(self, query: str, token: str, offset: int = 0, limit: int = 20) \
            -> PaginatedSearchResult[Playlist]:
        result = self._get_search(query, token, [SpotifyPlayableType.Playlist.value], offset, limit)
        return _build_paginated_result(result["playlists"], _build_playlist)


SearchSpotifyClient = Annotated[SearchSpotifyClientRaw, Depends()]
