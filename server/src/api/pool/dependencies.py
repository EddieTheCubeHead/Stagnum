import json
from typing import Annotated

from fastapi import Depends
from sqlalchemy import delete
from sqlalchemy.orm import Session

from api.common.dependencies import SpotifyClient, DatabaseConnection
from api.pool.models import PoolContent, Pool, PoolCollection, PoolTrack
from database.entities import PoolMember, User


def _auth_header(token: str) -> dict:
    return {
        "Authorization": token
    }


def _get_sharpest_icon(icons: list[dict]) -> str:
    max_size = icons[0]["height"] if icons[0]["height"] is not None else 0
    biggest_icon = icons[0]["url"]
    for icon in icons:
        if (icon["height"] or 0) > max_size:
            max_size = icon["height"]
            biggest_icon = icon["url"]
    return biggest_icon


def _build_tracks_with_image(tracks: list[dict], icon_uri: str) -> list[PoolTrack]:
    # Weird bug at least in my test set where this fails pydantic validation if we return the list comprehension.
    # Extracting it into a separate variable fixed the bug. Mb investigate and report to pydantic?
    tracks = [PoolTrack(name=track["name"], spotify_icon_uri=icon_uri, spotify_track_uri=track["uri"]) for track in
              tracks]
    return tracks


def _build_tracks_without_image(tracks: list[dict]) -> list[PoolTrack]:
    tracks = [PoolTrack(name=track["name"],
                        spotify_icon_uri=_get_sharpest_icon(track["album"]["images"]),
                        spotify_track_uri=track["uri"])
              for track in tracks]
    return tracks


class PoolSpotifyClientRaw:

    def __init__(self, spotify_client: SpotifyClient):
        self._spotify_client = spotify_client
        self._fetch_methods = {
            "track": self._fetch_track,
            "album": self._fetch_album,
            "artist": self._fetch_artist,
            "playlist": self._fetch_playlist
        }

    def get_pool_content(self, token: str, *pool_contents: PoolContent) -> Pool:
        pool_tracks: list[PoolTrack] = []
        pool_collections: list[PoolCollection] = []
        for pool_content in pool_contents:
            content = self._fetch_content(token, pool_content.spotify_uri)
            if type(content) is PoolTrack:
                pool_tracks.append(content)
            else:
                pool_collections.append(content)
        return Pool(tracks=pool_tracks, collections=pool_collections)

    def _fetch_content(self, token: str, content_uri: str) -> PoolTrack | PoolCollection:
        _, content_type, content_id = content_uri.split(":")
        return self._fetch_methods[content_type](token, content_id)

    def _fetch_track(self, token: str, track_id: str) -> PoolTrack:
        raw_track_data = self._spotify_client.get(f"tracks/{track_id}", headers=_auth_header(token))
        track_data = json.loads(raw_track_data.content.decode("utf-8"))
        return PoolTrack(name=track_data["name"], spotify_icon_uri=_get_sharpest_icon(track_data["album"]["images"]),
                         spotify_track_uri=track_data["uri"])

    def _fetch_album(self, token: str, album_id: str) -> PoolCollection:
        raw_album_data = self._spotify_client.get(f"albums/{album_id}", headers=_auth_header(token))
        album_data = json.loads(raw_album_data.content.decode("utf-8"))
        sharpest_icon_url = _get_sharpest_icon(album_data["images"])
        tracks = _build_tracks_with_image(album_data["tracks"]["items"], sharpest_icon_url)
        return PoolCollection(name=album_data["name"], spotify_icon_uri=sharpest_icon_url, tracks=tracks)

    def _fetch_artist(self, token: str, artist_id: str) -> PoolCollection:
        token_header = _auth_header(token)
        raw_artist_data = self._spotify_client.get(f"artists/{artist_id}", headers=token_header)
        artist_data = json.loads(raw_artist_data.content.decode("utf-8"))
        raw_artist_track_data = self._spotify_client.get(f"artists/{artist_id}/top-tracks", headers=token_header)
        artist_track_data = json.loads(raw_artist_track_data.content.decode("utf-8"))
        tracks = _build_tracks_without_image(artist_track_data["tracks"])
        return PoolCollection(name=artist_data["name"], spotify_icon_uri=_get_sharpest_icon(artist_data["images"]),
                              tracks=tracks)

    def _fetch_playlist(self, token: str, playlist_id: str) -> PoolCollection:
        raw_playlist_data = self._spotify_client.get(f"playlists/{playlist_id}", headers=_auth_header(token))
        playlist_data = json.loads(raw_playlist_data.content.decode("utf-8"))
        tracks = _build_tracks_without_image(playlist_data["tracks"]["items"])
        return PoolCollection(name=playlist_data["name"], spotify_icon_uri=_get_sharpest_icon(playlist_data["images"]),
                              tracks=tracks)


PoolSpotifyClient = Annotated[PoolSpotifyClientRaw, Depends()]


def _create_pool_member_entities(pool: Pool, user: User, session: Session):
    current_sort_order = 0
    for track in pool.tracks:
        session.add(PoolMember(user_id=user.spotify_id, content_uri=track.spotify_track_uri,
                               image_url=track.spotify_icon_uri, name=track.name, sort_order=current_sort_order))
        current_sort_order += 1
    for collection in pool.collections:
        parent = PoolMember(user_id=user.spotify_id, image_url=collection.spotify_icon_uri,
                            name=collection.name)
        session.add(parent)
        for track in collection.tracks:
            parent.children.append(PoolMember(user_id=user.spotify_id, content_uri=track.spotify_track_uri,
                                              image_url=track.spotify_icon_uri, name=track.name, parent_id=parent.id,
                                              sort_order=current_sort_order))
            current_sort_order += 1


def _purge_existing_pool(user, session):
    session.execute(delete(PoolMember).where(PoolMember.user_id == user.spotify_id))


class PoolDatabaseConnectionRaw:

    def __init__(self, database_connection: DatabaseConnection):
        self._database_connection = database_connection

    def save_pool(self, pool: Pool, user: User):
        with self._database_connection.session() as session:
            _purge_existing_pool(user, session)
            _create_pool_member_entities(pool, user, session)


PoolDatabaseConnection = Annotated[PoolDatabaseConnectionRaw, Depends()]
