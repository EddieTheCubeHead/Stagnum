import json
from logging import getLogger
from typing import Annotated

from fastapi import Depends

from api.common.dependencies import SpotifyClient
from api.common.helpers import get_sharpest_icon, build_auth_header
from api.common.models import NamedResource
from api.search.models import Track, Album, Artist, Playlist, PaginatedSearchResult, GeneralSearchResult, \
    SpotifyPlayableType, ArtistSearchResult, AlbumSearchResult, TrackSearchResult, PlaylistSearchResult
from database.entities import User

_logger = getLogger("main.api.search.dependencies")


def _build_track(track_data: dict) -> Track:
    album_artists = [NamedResource(name=artist["name"], link=artist["href"]) for artist in
                     track_data["album"]["artists"]]
    return Track(
        artists=[NamedResource(name=artist["name"], link=artist["href"])
                 for artist in track_data["artists"]],
        album=Album(name=track_data["album"]["name"],
                    uri=track_data["album"]["uri"],
                    artists=album_artists,
                    icon_link=get_sharpest_icon(track_data["album"]["images"]),
                    year=int(track_data["album"]["release_date"][:4]),
                    link=track_data["album"]["href"]),
        duration_ms=track_data["duration_ms"],
        name=track_data["name"],
        uri=track_data["uri"],
        link=track_data["href"]
    )


def _build_paginated_track_search(result_data):
    return TrackSearchResult(
        limit=result_data["limit"],
        offset=result_data["offset"],
        total=result_data["total"],
        results=[_build_track(track) for track in result_data["items"]],
        self_page_link=result_data["href"],
        next_page_link=result_data["next"]
    )


def _build_artist(artist_data: dict) -> Artist:
    return Artist(
        name=artist_data["name"],
        uri=artist_data["uri"],
        icon_link=get_sharpest_icon(artist_data["images"]),
        link=artist_data["href"]
    )


def _build_paginated_artist_search(result_data):
    return ArtistSearchResult(
        limit=result_data["limit"],
        offset=result_data["offset"],
        total=result_data["total"],
        results=[_build_artist(artist) for artist in result_data["items"]],
        self_page_link=result_data["href"],
        next_page_link=result_data["next"]
    )


def _build_album(album_data: dict) -> Album:
    return Album(
        artists=[NamedResource(name=artist["name"], link=artist["href"]) for artist in album_data["artists"]],
        year=int(album_data["release_date"][:4]),
        icon_link=get_sharpest_icon(album_data["images"]),
        name=album_data["name"],
        uri=album_data["uri"],
        link=album_data["href"]
    )


def _build_paginated_album_search(result_data):
    return AlbumSearchResult(
        limit=result_data["limit"],
        offset=result_data["offset"],
        total=result_data["total"],
        results=[_build_album(album) for album in result_data["items"]],
        self_page_link=result_data["href"],
        next_page_link=result_data["next"]
    )


def _build_playlist(playlist_data: dict) -> Playlist:
    return Playlist(
        name=playlist_data["name"],
        uri=playlist_data["uri"],
        icon_link=get_sharpest_icon(playlist_data["images"]),
        link=playlist_data["href"]
    )


def _build_paginated_playlist_search(result_data):
    return PlaylistSearchResult(
        limit=result_data["limit"],
        offset=result_data["offset"],
        total=result_data["total"],
        results=[_build_playlist(playlist) for playlist in result_data["items"]],
        self_page_link=result_data["href"],
        next_page_link=result_data["next"]
    )


class SearchSpotifyClientRaw:
    def __init__(self, spotify_client: SpotifyClient):
        self._spotify_client = spotify_client

    def get_general_search(self, query: str, user: User, types: list[str]) \
            -> GeneralSearchResult:
        result = self._get_search(query, user, types)
        artist_result: ArtistSearchResult = _build_paginated_artist_search(result["artists"])
        album_result: AlbumSearchResult = _build_paginated_album_search(result["albums"])
        tracks_result: TrackSearchResult = _build_paginated_track_search(result["tracks"])
        playlists_result: PlaylistSearchResult = _build_paginated_playlist_search(result["playlists"])
        print(type(playlists_result))
        return GeneralSearchResult(tracks=tracks_result, artists=artist_result, albums=album_result,
                                   playlists=playlists_result)

    def _get_search(self, query: str, user: User, types: list[str], offset: int = 0, limit: int = 20) -> dict:
        search_types = ",".join(types)
        headers = build_auth_header(user)
        query_string = f"search?q={query}&type={search_types}&offset={offset}&limit={limit}"
        _logger.debug(f"Searching spotify with query '{query_string}'")
        raw_result = self._spotify_client.get(query_string, headers=headers)
        _logger.debug(f"Received result {raw_result}")
        return json.loads(raw_result.content.decode("utf8"))

    def get_track_search(self, query: str, user: User, offset: int = 0, limit: int = 20) \
            -> PaginatedSearchResult[Track]:
        result = self._get_search(query, user, [SpotifyPlayableType.Track.value], offset, limit)
        return _build_paginated_track_search(result["tracks"])

    def get_album_search(self, query: str, user: User, offset: int = 0, limit: int = 20) \
            -> PaginatedSearchResult[Album]:
        result = self._get_search(query, user, [SpotifyPlayableType.Album.value], offset, limit)
        return _build_paginated_album_search(result["albums"])

    def get_artist_search(self, query: str, user: User, offset: int = 0, limit: int = 20) \
            -> PaginatedSearchResult[Artist]:
        result = self._get_search(query, user, [SpotifyPlayableType.Artist.value], offset, limit)
        return _build_paginated_artist_search(result["artists"])

    def get_playlist_search(self, query: str, user: User, offset: int = 0, limit: int = 20) \
            -> PaginatedSearchResult[Playlist]:
        result = self._get_search(query, user, [SpotifyPlayableType.Playlist.value], offset, limit)
        return _build_paginated_playlist_search(result["playlists"])


SearchSpotifyClient = Annotated[SearchSpotifyClientRaw, Depends()]
