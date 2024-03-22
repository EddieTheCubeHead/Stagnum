import datetime
import json
import random
from logging import getLogger
from typing import Annotated

from fastapi import Depends
from sqlalchemy import delete, and_, select, or_
from sqlalchemy.orm import Session, joinedload

from api.common.dependencies import SpotifyClient, DatabaseConnection, TokenHolder
from api.common.helpers import get_sharpest_icon, map_user_entity_to_model, build_auth_header, create_random_string
from api.common.models import UserModel
from api.pool.models import PoolContent, PoolCollection, PoolTrack, PoolUserContents
from database.entities import PoolMember, User, PlaybackSession, Pool, PoolJoinedUser, PoolShareData

_logger = getLogger("main.api.pool.dependencies")


def _build_tracks_with_image(tracks: list[dict], icon_uri: str) -> list[PoolTrack]:
    # Weird bug at least in my test set where this fails pydantic validation if we return the list comprehension.
    # Extracting it into a separate variable fixed the bug. Mb investigate and report to pydantic?
    tracks = [PoolTrack(name=track["name"],
                        spotify_icon_uri=icon_uri,
                        spotify_track_uri=track["uri"],
                        duration_ms=track["duration_ms"])
              for track in tracks]
    return tracks


def _build_tracks_without_image(tracks: list[dict]) -> list[PoolTrack]:
    tracks = [PoolTrack(name=track["name"],
                        spotify_icon_uri=get_sharpest_icon(track["album"]["images"]),
                        spotify_track_uri=track["uri"],
                        duration_ms=track["duration_ms"])
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

    def get_pool_content(self, user: User, *pool_contents: PoolContent) -> PoolUserContents:
        pool_tracks: list[PoolTrack] = []
        pool_collections: list[PoolCollection] = []
        for pool_content in pool_contents:
            _logger.debug(f"Fetching spotify content with uri {pool_content.spotify_uri}")
            content = self._fetch_content(user, pool_content.spotify_uri)
            if type(content) is PoolTrack:
                pool_tracks.append(content)
            else:
                pool_collections.append(content)
        user_model = map_user_entity_to_model(user)
        return PoolUserContents(tracks=pool_tracks, collections=pool_collections, user=user_model)

    def _fetch_content(self, user: User, content_uri: str) -> PoolTrack | PoolCollection:
        _, content_type, content_id = content_uri.split(":")
        return self._fetch_methods[content_type](user, content_id)

    def _fetch_track(self, user: User, track_id: str) -> PoolTrack:
        raw_track_data = self._spotify_client.get(f"tracks/{track_id}", headers=build_auth_header(user))
        track_data = json.loads(raw_track_data.content.decode("utf-8"))
        return PoolTrack(name=track_data["name"], spotify_icon_uri=get_sharpest_icon(track_data["album"]["images"]),
                         spotify_track_uri=track_data["uri"], duration_ms=track_data["duration_ms"])

    def _fetch_album(self, user: User, album_id: str) -> PoolCollection:
        raw_album_data = self._spotify_client.get(f"albums/{album_id}", headers=build_auth_header(user))
        album_data = json.loads(raw_album_data.content.decode("utf-8"))
        sharpest_icon_url = get_sharpest_icon(album_data["images"])
        tracks = _build_tracks_with_image(album_data["tracks"]["items"], sharpest_icon_url)
        return PoolCollection(name=album_data["name"], spotify_icon_uri=sharpest_icon_url, tracks=tracks,
                              spotify_collection_uri=album_data["uri"])

    def _fetch_artist(self, user: User, artist_id: str) -> PoolCollection:
        token_header = build_auth_header(user)
        raw_artist_data = self._spotify_client.get(f"artists/{artist_id}", headers=token_header)
        artist_data = json.loads(raw_artist_data.content.decode("utf-8"))
        raw_artist_track_data = self._spotify_client.get(f"artists/{artist_id}/top-tracks", headers=token_header)
        artist_track_data = json.loads(raw_artist_track_data.content.decode("utf-8"))
        tracks = _build_tracks_without_image(artist_track_data["tracks"])
        return PoolCollection(name=artist_data["name"], spotify_icon_uri=get_sharpest_icon(artist_data["images"]),
                              tracks=tracks, spotify_collection_uri=artist_data["uri"])

    def _fetch_playlist(self, user: User, playlist_id: str) -> PoolCollection:
        playlist_data = self._fully_fetch_playlist(playlist_id, user)
        tracks = _build_tracks_without_image([track["track"] for track in playlist_data["tracks"]["items"]])
        return PoolCollection(name=playlist_data["name"], spotify_icon_uri=get_sharpest_icon(playlist_data["images"]),
                              tracks=tracks, spotify_collection_uri=playlist_data["uri"])

    def _fully_fetch_playlist(self, playlist_id: str, user: User):
        raw_playlist_data = self._spotify_client.get(f"playlists/{playlist_id}", headers=build_auth_header(user))
        playlist_data = json.loads(raw_playlist_data.content.decode("utf-8"))
        if playlist_data["tracks"]["next"] is not None:
            self._fetch_large_playlist_tracks(playlist_data, user)
        return playlist_data

    def _fetch_large_playlist_tracks(self, playlist_data, user: User):
        track_walker = playlist_data["tracks"]
        while track_walker["next"] is not None:
            raw_next_track_data = self._spotify_client.get(override_url=track_walker["next"],
                                                           headers=build_auth_header(user))
            track_walker = json.loads(raw_next_track_data.content.decode("utf-8"))
            playlist_data["tracks"]["items"].extend(track_walker["items"])

    def start_playback(self, user: User, track_uri: str):
        header = build_auth_header(user)
        header["Content-Type"] = "application/json"
        self._spotify_client.put("me/player/play", json={"uris": [track_uri], "position_ms": 0}, headers=header)

    def set_next_song(self, user: User, track_uri: str):
        header = build_auth_header(user)
        self._spotify_client.post(f"me/player/queue?uri={track_uri}", headers=header)

    def skip_current_song(self, user: User):
        header = build_auth_header(user)
        self._spotify_client.post("me/player/next", headers=header)


PoolSpotifyClient = Annotated[PoolSpotifyClientRaw, Depends()]


def _create_pool_member_entities(pool_contents: PoolUserContents, pool: Pool, session: Session):
    _logger.debug("Creating pool member database entities")
    current_sort_order = 0
    for track in pool_contents.tracks:
        session.add(PoolMember(user_id=pool_contents.user.spotify_id, content_uri=track.spotify_track_uri,
                               image_url=track.spotify_icon_uri, name=track.name, sort_order=current_sort_order,
                               duration_ms=track.duration_ms, pool_id=pool.id))
        current_sort_order += 1
    for collection in pool_contents.collections:
        parent = PoolMember(user_id=pool_contents.user.spotify_id, image_url=collection.spotify_icon_uri,
                            name=collection.name, content_uri=collection.spotify_collection_uri,
                            sort_order=current_sort_order, pool_id=pool.id)
        session.add(parent)
        current_sort_order += 1
        for track in collection.tracks:
            parent.children.append(
                PoolMember(user_id=pool_contents.user.spotify_id, content_uri=track.spotify_track_uri,
                           image_url=track.spotify_icon_uri, name=track.name, parent_id=parent.id,
                           sort_order=current_sort_order, duration_ms=track.duration_ms, pool_id=pool.id))
            current_sort_order += 1


def _purge_existing_transient_pool(user, session):
    _logger.info(f"Purging existing pool for user {user.display_name}")
    session.execute(delete(PoolMember).where(PoolMember.user_id == user.spotify_id))
    session.execute(delete(Pool).where(and_(Pool.name == None, Pool.owner_user_id == user.spotify_id)))


def _get_user_pool(user: User, session: Session) -> list[PoolMember]:
    _logger.debug(f"Getting current pool for user {user.spotify_username}")
    return list(session.scalars(
        select(PoolMember).where(and_(PoolMember.user_id == user.spotify_id, PoolMember.parent_id == None))
        .options(joinedload(PoolMember.children))).unique().all())


def _get_playable_tracks(user: User, session: Session) -> list[PoolMember]:
    _logger.debug(f"Getting playable tracks for user {user.spotify_username}")
    return list(session.scalars(select(PoolMember).where(
        and_(PoolMember.user_id == user.spotify_id, PoolMember.content_uri.like("spotify:track:%")))).unique().all())


def _delete_pool_member(content_uri: str, user: User, session: Session):
    _logger.debug(f"Deleting pool member with uri {content_uri} and all children "
                  f"from user {user.spotify_username}'s pool")
    possible_parent = session.scalar(
        select(PoolMember).where(and_(PoolMember.content_uri == content_uri, PoolMember.user_id == user.spotify_id)))
    session.execute(delete(PoolMember).where(
        and_(PoolMember.parent_id == possible_parent.id, PoolMember.user_id == user.spotify_id)))
    session.delete(possible_parent)


def _update_user_playback(existing_playback: PlaybackSession, playing_track: PoolMember,
                          override_timestamp: bool = False):
    existing_playback.current_track_id = playing_track.id
    if not override_timestamp:
        delta = max(existing_playback.next_song_change_timestamp - datetime.datetime.now(),
                    datetime.timedelta(milliseconds=0))
    else:
        delta = datetime.timedelta(milliseconds=0)
    new_end_time = datetime.datetime.now(datetime.timezone.utc) + delta + datetime.timedelta(
        milliseconds=playing_track.duration_ms)
    existing_playback.next_song_change_timestamp = new_end_time
    existing_playback.is_active = True


def _crete_user_playback(session: Session, user: User, playing_track: PoolMember):
    end_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(milliseconds=playing_track.duration_ms)
    session.add(PlaybackSession(
        current_track_id=playing_track.id,
        next_song_change_timestamp=end_time,
        user_id=user.spotify_id
    ))


def _create_transient_pool(user: UserModel, session: Session):
    pool = Pool(name=None, owner_user_id=user.spotify_id)
    session.add(pool)
    session.commit()  # force id to the pool
    return pool


def _get_pool_for_user(user: User, session: Session) -> Pool:
    return session.scalar(select(Pool).where(Pool.owner_user_id == user.spotify_id))


class PoolDatabaseConnectionRaw:

    def __init__(self, database_connection: DatabaseConnection):
        self._database_connection = database_connection

    def create_pool(self, pool: PoolUserContents):
        with self._database_connection.session() as session:
            _purge_existing_transient_pool(pool.user, session)
            transient_pool = _create_transient_pool(pool.user, session)
            _create_pool_member_entities(pool, transient_pool, session)

    def add_to_pool(self, contents: PoolUserContents, user: User) -> list[PoolMember]:
        with self._database_connection.session() as session:
            pool = _get_pool_for_user(user, session)
            if pool is None:
                pool = _create_transient_pool(map_user_entity_to_model(user), session)
            _create_pool_member_entities(contents, pool, session)
            whole_pool = _get_user_pool(user, session)
        return whole_pool

    def delete_from_pool(self, content_uri: str, user: User) -> list[PoolMember]:
        with self._database_connection.session() as session:
            _delete_pool_member(content_uri, user, session)
            whole_pool = _get_user_pool(user, session)
        return whole_pool

    def get_pool(self, user: User) -> (list[PoolMember], list[User]):
        with self._database_connection.session() as session:
            whole_pool = _get_user_pool(user, session)
            pool_users = self.get_pool_users(user)
        return whole_pool, pool_users

    def get_playable_tracks(self, user: User) -> list[PoolMember]:
        with self._database_connection.session() as session:
            all_tracks = _get_playable_tracks(user, session)
        return all_tracks

    def save_playback_status(self, user: User, playing_track: PoolMember, override_timestamp: bool = False):
        with self._database_connection.session() as session:
            existing_playback = session.scalar(
                select(PlaybackSession).where(PlaybackSession.user_id == user.spotify_id))
            if existing_playback is not None:
                _update_user_playback(existing_playback, playing_track, override_timestamp)
            else:
                _crete_user_playback(session, user, playing_track)

    def get_playbacks_to_update(self) -> list[PlaybackSession]:
        cutoff_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=2)
        with self._database_connection.session() as session:
            playbacks = session.scalars(select(PlaybackSession).where(
                and_(PlaybackSession.is_active,
                     PlaybackSession.next_song_change_timestamp < cutoff_time))).unique().all()
        return playbacks

    def set_playback_as_inactive(self, playback: PlaybackSession):
        with self._database_connection.session() as session:
            playback = session.scalar(select(PlaybackSession).where(PlaybackSession.user_id == playback.user_id))
            playback.is_active = False

    def get_pool_users(self, user: User) -> list[User]:
        with self._database_connection.session() as session:
            pool = session.scalar(select(Pool).where(or_(Pool.owner_user_id == user.spotify_id, Pool.joined_users.any(
                PoolJoinedUser.user_id == user.spotify_id))))
            users = session.scalars(select(User).where(
                or_(User.spotify_id == pool.owner_user_id,
                    User.joined_pool.has(PoolJoinedUser.pool_id == pool.id)))).unique().all()
        return users

    def share_pool(self, user: User) -> (list[PoolMember], list[User], str):
        share_code = create_random_string(8).upper()
        with self._database_connection.session() as session:
            pool = session.scalar(select(Pool).where(Pool.owner_user_id == user.spotify_id))
            pool.share_data = PoolShareData(code=share_code)
            return *self.get_pool(user), share_code


PoolDatabaseConnection = Annotated[PoolDatabaseConnectionRaw, Depends()]


class PoolPlaybackServiceRaw:

    def __init__(self, database_connection: PoolDatabaseConnection, spotify_client: PoolSpotifyClient,
                 token_holder: TokenHolder):
        self._database_connection = database_connection
        self._spotify_client = spotify_client
        self._token_holder = token_holder

    def start_playback(self, user: User):
        all_tracks = self._database_connection.get_playable_tracks(user)
        next_track = random.choice(all_tracks)
        self._spotify_client.start_playback(user, next_track.content_uri)
        self._database_connection.save_playback_status(user, next_track)

    def update_user_playbacks(self):
        active_playbacks = self._database_connection.get_playbacks_to_update()
        for playback in active_playbacks:
            self._update_playback(playback)

    def _update_playback(self, playback: PlaybackSession):
        if not self._token_holder.is_user_logged_in(playback.user_id):
            self._database_connection.set_playback_as_inactive(playback)
            return
        user = self._token_holder.get_from_user_id(playback.user_id)
        self._queue_next_song(user)

    def _queue_next_song(self, user: User, override_timestamp: bool = False) -> PoolMember:
        playable_tracks = self._database_connection.get_playable_tracks(user)
        next_song: PoolMember = random.choice(playable_tracks)
        _logger.info(f"Adding song {next_song.name} to queue for user {user.spotify_username}")
        self._spotify_client.set_next_song(user, next_song.content_uri)
        self._database_connection.save_playback_status(user, next_song, override_timestamp)
        return next_song

    def skip_song(self, user: User) -> PoolTrack:
        next_song = self._queue_next_song(user, True)
        self._spotify_client.skip_current_song(user)
        return PoolTrack(name=next_song.name, spotify_icon_uri=next_song.image_url,
                         spotify_track_uri=next_song.content_uri, duration_ms=next_song.duration_ms)


PoolPlaybackService = Annotated[PoolPlaybackServiceRaw, Depends()]
