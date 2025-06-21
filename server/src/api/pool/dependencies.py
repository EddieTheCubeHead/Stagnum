import datetime
from logging import getLogger
from typing import Annotated, Any, ClassVar, Literal, Optional

from fastapi import Depends, HTTPException, WebSocket
from sqlalchemy import and_, delete, exists, func, or_, select, update
from sqlalchemy.orm import Session, joinedload

from api.common.dependencies import DatabaseConnection, DateTimeWrapper, SpotifyClient, TokenHolder
from api.common.helpers import build_auth_header, create_random_string, get_sharpest_icon, map_user_entity_to_model
from api.common.models import UserModel
from api.common.spotify_models import PlaylistData
from api.pool.helpers import (
    create_pool_return_model,
    map_pool_member_entity_to_model,
    map_unsaved_pool_member_entity_to_model,
)
from api.pool.models import (
    PoolContent,
    PoolFullContents,
    PoolTrack,
    UnsavedPoolCollection,
    UnsavedPoolTrack,
    UnsavedPoolUserContents,
)
from api.pool.models import PoolMember as PoolMemberModel
from api.pool.randomization_algorithms import NextSongProvider
from api.pool.spotify_models import PlaybackStateData, QueueData
from database.entities import (
    PlaybackSession,
    PlayedPoolMember,
    Pool,
    PoolJoinedUser,
    PoolMember,
    PoolMemberRandomizationParameters,
    PoolShareData,
    User,
)

_logger = getLogger("main.api.pool.dependencies")
_PLAYBACK_UPDATE_CUTOFF_MS = 3000

FullPoolData = (list[PoolMember], list[User], bool, PoolTrack | None, str | None)


def _build_tracks_with_image(tracks: list[dict], icon_uri: str) -> list[UnsavedPoolTrack]:
    # Weird bug at least in my test set where this fails pydantic validation if we return the list comprehension.
    # Extracting it into a separate variable fixed the bug. Mb investigate and report to pydantic?
    return [
        UnsavedPoolTrack(
            name=track["name"],
            spotify_icon_uri=icon_uri,
            spotify_resource_uri=track["uri"],
            duration_ms=track["duration_ms"],
        )
        for track in tracks
    ]


def _build_tracks_without_image(tracks: list[dict]) -> list[UnsavedPoolTrack]:
    return [
        UnsavedPoolTrack(
            name=track["name"],
            spotify_icon_uri=get_sharpest_icon(track["album"]["images"]),
            spotify_resource_uri=track["uri"],
            duration_ms=track["duration_ms"],
        )
        for track in tracks
        if track is not None
    ]


class PoolSpotifyClientRaw:
    def __init__(self, spotify_client: SpotifyClient) -> None:
        self._spotify_client = spotify_client
        self._fetch_methods = {
            "track": self._fetch_track,
            "album": self._fetch_album,
            "artist": self._fetch_artist,
            "playlist": self._fetch_playlist,
        }

    def get_unsaved_pool_content(self, user: User, *pool_contents: PoolContent) -> UnsavedPoolUserContents:
        pool_tracks: list[UnsavedPoolTrack] = []
        pool_collections: list[UnsavedPoolCollection] = []
        for pool_content in pool_contents:
            _logger.debug(f"Fetching spotify content with uri {pool_content.spotify_uri}")
            content = self._fetch_content(user, pool_content.spotify_uri)
            if type(content) is UnsavedPoolTrack:
                pool_tracks.append(content)
            else:
                pool_collections.append(content)
        user_model = map_user_entity_to_model(user)
        return UnsavedPoolUserContents(tracks=pool_tracks, collections=pool_collections, user=user_model)

    def _fetch_content(self, user: User, content_uri: str) -> UnsavedPoolTrack | UnsavedPoolCollection:
        _, content_type, content_id = content_uri.split(":")
        return self._fetch_methods[content_type](user, content_id)

    def _fetch_track(self, user: User, track_id: str) -> UnsavedPoolTrack:
        track_data = self._spotify_client.get(f"tracks/{track_id}", headers=build_auth_header(user))
        return UnsavedPoolTrack(
            name=track_data["name"],
            spotify_icon_uri=get_sharpest_icon(track_data["album"]["images"]),
            spotify_resource_uri=track_data["uri"],
            duration_ms=track_data["duration_ms"],
        )

    def _fetch_album(self, user: User, album_id: str) -> UnsavedPoolCollection:
        album_data = self._spotify_client.get(f"albums/{album_id}", headers=build_auth_header(user))
        sharpest_icon_url = get_sharpest_icon(album_data["images"])
        tracks = _build_tracks_with_image(album_data["tracks"]["items"], sharpest_icon_url)
        return UnsavedPoolCollection(
            name=album_data["name"],
            spotify_icon_uri=sharpest_icon_url,
            tracks=tracks,
            spotify_resource_uri=album_data["uri"],
        )

    def _fetch_artist(self, user: User, artist_id: str) -> UnsavedPoolCollection:
        token_header = build_auth_header(user)
        artist_data = self._spotify_client.get(f"artists/{artist_id}", headers=token_header)
        artist_track_data = self._spotify_client.get(f"artists/{artist_id}/top-tracks", headers=token_header)
        tracks = _build_tracks_without_image(artist_track_data["tracks"])
        return UnsavedPoolCollection(
            name=artist_data["name"],
            spotify_icon_uri=get_sharpest_icon(artist_data["images"]),
            tracks=tracks,
            spotify_resource_uri=artist_data["uri"],
        )

    def _fetch_playlist(self, user: User, playlist_id: str) -> UnsavedPoolCollection:
        playlist_data = self._fully_fetch_playlist(playlist_id, user)
        tracks = _build_tracks_without_image([track["track"] for track in playlist_data["tracks"]["items"]])
        return UnsavedPoolCollection(
            name=playlist_data["name"],
            spotify_icon_uri=get_sharpest_icon(playlist_data["images"]),
            tracks=tracks,
            spotify_resource_uri=playlist_data["uri"],
        )

    def _fully_fetch_playlist(self, playlist_id: str, user: User) -> PlaylistData:
        playlist_data = self._spotify_client.get(f"playlists/{playlist_id}", headers=build_auth_header(user))
        if playlist_data["tracks"]["next"] is not None:
            self._fetch_large_playlist_tracks(playlist_data, user)
        return playlist_data

    def _fetch_large_playlist_tracks(self, playlist_data: PlaylistData, user: User) -> None:
        track_walker = playlist_data["tracks"]
        while track_walker["next"] is not None:
            track_walker = self._spotify_client.get(override_url=track_walker["next"], headers=build_auth_header(user))
            playlist_data["tracks"]["items"].extend(track_walker["items"])

    def start_playback(self, user: User, track_uri: str) -> None:
        header = build_auth_header(user)
        header["Content-Type"] = "application/json"
        self._spotify_client.put("me/player/play", json={"uris": [track_uri], "position_ms": 0}, headers=header)

    def set_next_song(self, user: User, track_uri: str) -> None:
        header = build_auth_header(user)
        self._spotify_client.post(f"me/player/queue?uri={track_uri}", headers=header)

    def skip_current_song(self, user: User) -> None:
        header = build_auth_header(user)
        self._spotify_client.post("me/player/next", headers=header)

    def get_user_playback(self, user: User) -> PlaybackStateData:
        header = build_auth_header(user)
        return self._spotify_client.get("me/player/currently-playing", headers=header)

    def get_user_queue(self, user: User) -> QueueData:
        header = build_auth_header(user)
        return self._spotify_client.get("me/player/queue", headers=header)

    def stop_playback(self, user: User) -> None:
        header = build_auth_header(user)
        return self._spotify_client.put("me/player/pause", headers=header)


PoolSpotifyClient = Annotated[PoolSpotifyClientRaw, Depends()]


def _create_pool_member_entities(pool_contents: UnsavedPoolUserContents, pool: Pool, session: Session) -> None:
    _logger.debug("Creating pool member database entities")
    current_sort_order = 0
    for track in pool_contents.tracks:
        pool_member = PoolMember(
            user_id=pool_contents.user.spotify_id,
            content_uri=track.spotify_resource_uri,
            image_url=track.spotify_icon_uri,
            name=track.name,
            sort_order=current_sort_order,
            duration_ms=track.duration_ms,
            pool_id=pool.id,
        )
        pool_member.randomization_parameters = PoolMemberRandomizationParameters()
        session.add(pool_member)
        current_sort_order += 1
    for collection in pool_contents.collections:
        parent = PoolMember(
            user_id=pool_contents.user.spotify_id,
            image_url=collection.spotify_icon_uri,
            name=collection.name,
            content_uri=collection.spotify_resource_uri,
            sort_order=current_sort_order,
            pool_id=pool.id,
        )
        session.add(parent)
        current_sort_order += 1
        for track in collection.tracks:
            pool_member = PoolMember(
                user_id=pool_contents.user.spotify_id,
                content_uri=track.spotify_resource_uri,
                image_url=track.spotify_icon_uri,
                name=track.name,
                sort_order=current_sort_order,
                duration_ms=track.duration_ms,
                pool_id=pool.id,
                parent_id=parent.id,
            )
            pool_member.randomization_parameters = PoolMemberRandomizationParameters()
            parent.children.append(pool_member)
            current_sort_order += 1


def _purge_existing_transient_pool(user: UserModel, session: Session) -> None:
    _logger.info(f"Purging existing pool for user {user.display_name}")
    session.execute(
        delete(PoolMemberRandomizationParameters).where(
            PoolMemberRandomizationParameters.pool_member.has(PoolMember.user_id == user.spotify_id)
        )
    )
    session.execute(delete(PoolMember).where(PoolMember.user_id == user.spotify_id))
    session.execute(
        delete(PoolJoinedUser).where(
            and_(PoolJoinedUser.pool.has(Pool.name == None)),  # noqa: E711
            PoolJoinedUser.user_id == user.spotify_id,
        )
    )
    session.execute(delete(Pool).where(and_(Pool.name == None, Pool.owner_user_id == user.spotify_id)))  # noqa: E711


def _purge_playback_users_pools(users: list[User], session: Session) -> None:
    user_ids = [user.spotify_id for user in users]
    session.execute(
        delete(PoolMemberRandomizationParameters).where(
            PoolMemberRandomizationParameters.pool_member.has(PoolMember.user_id.in_(user_ids))
        )
    )
    session.execute(delete(PoolMember).where(PoolMember.user_id.in_(user_ids)))
    session.execute(
        delete(PoolJoinedUser).where(
            PoolJoinedUser.pool.has(
                and_(
                    # because SQLAlchemy doesn't support is None
                    Pool.name == None,  # noqa: E711
                    Pool.owner_user_id.in_(user_ids),
                )
            )
        )
    )
    # because SQLAlchemy doesn't support is None
    session.execute(delete(Pool).where(and_(Pool.name == None, Pool.owner_user_id.in_(user_ids))))  # noqa: E711


def _get_user_pool(user: User, session: Session) -> list[PoolMember]:
    _logger.debug(f"Getting current pool for user {user.spotify_username}")
    pool = _get_pool_for_user(user, session)
    if pool is None:
        raise HTTPException(status_code=404, detail=f"Could not find pool for user {user.spotify_username}")
    return list(
        session.scalars(
            select(PoolMember)
            # because SQLAlchemy doesn't support is None
            .where(and_(PoolMember.pool_id == pool.id, PoolMember.parent_id == None))  # noqa: E711
            .order_by(PoolMember.sort_order)
            .options(joinedload(PoolMember.children))
        )
        .unique()
        .all()
    )


def _get_playable_tracks(user: User, session: Session) -> list[PoolMember]:
    _logger.debug(f"Getting playable tracks for user {user.spotify_username}")
    pool = _get_pool_for_user(user, session)
    return list(
        session.scalars(
            select(PoolMember).where(
                and_(PoolMember.pool_id == pool.id, PoolMember.content_uri.like("spotify:track:%"))
            )
        )
        .unique()
        .all()
    )


def _get_and_validate_member_to_delete(content_id: int, user: User, session: Session) -> PoolMember:
    matching_members = session.scalars(select(PoolMember).where(PoolMember.id == content_id)).unique().all()
    if len(matching_members) == 0:
        raise HTTPException(status_code=404, detail="Can't delete a pool member that does not exist.")

    owned_members = [member for member in matching_members if member.user_id == user.spotify_id]
    if len(owned_members) == 0:
        raise HTTPException(status_code=400, detail="Can't delete a pool member added by another user.")

    return owned_members[0]


def _delete_pool_member(possible_parent: PoolMember, user: User, session: Session) -> None:
    _logger.debug(
        f"Deleting pool member with uri {possible_parent.content_uri} and all children "
        f"from user {user.spotify_username}'s pool"
    )

    session.execute(
        update(PoolJoinedUser)
        .where(
            or_(
                PoolJoinedUser.promoted_track_id == possible_parent.id,
                PoolJoinedUser.promoted_track.has(PoolMember.parent_id == possible_parent.id),
            )
        )
        .values(promoted_track_id=None)
    )

    session.execute(
        delete(PoolMemberRandomizationParameters).where(
            PoolMemberRandomizationParameters.pool_member.has(
                and_(PoolMember.parent_id == possible_parent.id, PoolMember.user_id == user.spotify_id)
            )
        )
    )
    session.execute(
        delete(PoolMember).where(
            and_(PoolMember.parent_id == possible_parent.id, PoolMember.user_id == user.spotify_id)
        )
    )

    if possible_parent.randomization_parameters is not None:
        session.delete(possible_parent.randomization_parameters)
    session.delete(possible_parent)


def _create_transient_pool(user: UserModel, session: Session) -> Pool:
    pool = Pool(name=None, owner_user_id=user.spotify_id)
    session.add(pool)
    session.commit()  # force id to the pool
    pool.joined_users.append(PoolJoinedUser(user_id=user.spotify_id))
    return pool


def _get_pool_for_user(user: User, session: Session) -> Pool:
    return session.scalar(
        select(Pool).where(
            or_(Pool.owner_user_id == user.spotify_id, Pool.joined_users.any(PoolJoinedUser.user_id == user.spotify_id))
        )
    )


def _validate_pool_join(pool: Pool | None, user: User, pool_code: str) -> None:
    if pool is None:
        raise HTTPException(status_code=404, detail=f'Could not find pool with code "{pool_code}"')
    if pool.owner_user_id == user.spotify_id:
        raise HTTPException(status_code=400, detail="Attempted to join own pool!")
    if user.spotify_id in (pool_user.user_id for pool_user in pool.joined_users):
        raise HTTPException(status_code=400, detail="Already a member of that pool!")


def _update_skips_since_last_play(session: Session, pool: Pool, playing_track: PoolMember) -> None:
    session.execute(
        update(PoolMemberRandomizationParameters)
        .where(
            and_(
                PoolMemberRandomizationParameters.pool_member.has(PoolMember.pool_id == pool.id),
                PoolMemberRandomizationParameters.skips_since_last_play > 0,
            )
        )
        .values(skips_since_last_play=(PoolMemberRandomizationParameters.skips_since_last_play + 1))
    )

    playing_track.randomization_parameters.skips_since_last_play = 1
    session.merge(playing_track)


def _remove_played_promoted_songs(session: Session, user: User, track: PoolMember) -> None:
    pool = _get_pool_for_user(user, session)
    promoted_users = (
        session.scalars(
            select(PoolJoinedUser).where(
                and_(PoolJoinedUser.pool_id == pool.id, PoolJoinedUser.promoted_track_id == track.id)
            )
        )
        .unique()
        .all()
    )

    for promoted_user in promoted_users:
        promoted_user.promoted_track = None


def _get_current_track(pool: Pool, session: Session) -> UnsavedPoolTrack | None:
    playback_session = session.scalar(select(PlaybackSession).where(PlaybackSession.user_id == pool.owner_user_id))
    if playback_session is None:
        return None
    return UnsavedPoolTrack(
        name=playback_session.current_track_name,
        spotify_icon_uri=playback_session.current_track_image_url,
        spotify_resource_uri=playback_session.current_track_uri,
        duration_ms=playback_session.current_track_duration_ms,
    )


def _validate_pool_member_addition(session: Session, pool_member: PoolMemberModel, user: User) -> None:
    if session.query(
        exists().where(
            and_(
                PoolMember.content_uri == pool_member.spotify_resource_uri,
                PoolMember.user_id == user.spotify_id,
                # because SQLAlchemy doesn't support is None
                PoolMember.parent_id == None,  # noqa: E711
            )
        )
    ).scalar():
        raise HTTPException(400, "Cannot add the same resource twice by the same user!")


def _validate_pool_member_additions(session: Session, contents: UnsavedPoolUserContents, user: User) -> None:
    for track in contents.tracks:
        _validate_pool_member_addition(session, track, user)
    for collection in contents.collections:
        _validate_pool_member_addition(session, collection, user)


def _promote_user_track(session: Session, track_id: str, user: User, pool: Pool) -> None:
    track = session.scalar(select(PoolMember).where(and_(PoolMember.pool_id == pool.id, PoolMember.id == track_id)))
    if track is None:
        raise HTTPException(400, "Could not find track to promote!")
    if not track.content_uri.startswith("spotify:track:"):
        raise HTTPException(400, "Cannot promote collections!")
    joined_user = session.scalar(select(PoolJoinedUser).where(PoolJoinedUser.user_id == user.spotify_id))
    joined_user.promoted_track = track


def _depromote_user_track(session: Session, user: User) -> None:
    pool_owner = session.scalar(select(PoolJoinedUser).where(PoolJoinedUser.user_id == user.spotify_id))
    pool_owner.promoted_track = None
    session.commit()


class PoolDatabaseConnectionRaw:
    def __init__(self, database_connection: DatabaseConnection, datetime_wrapper: DateTimeWrapper) -> None:
        self._database_connection = database_connection
        self._datetime_wrapper = datetime_wrapper

    def create_pool(self, pool: UnsavedPoolUserContents) -> None:
        with self._database_connection.session() as session:
            _purge_existing_transient_pool(pool.user, session)
            transient_pool = _create_transient_pool(pool.user, session)
            _create_pool_member_entities(pool, transient_pool, session)

    def add_to_pool(self, contents: UnsavedPoolUserContents, user: User) -> list[PoolMember]:
        with self._database_connection.session() as session:
            _validate_pool_member_additions(session, contents, user)
            pool = _get_pool_for_user(user, session)
            if pool is None:
                pool = _create_transient_pool(map_user_entity_to_model(user), session)
            _create_pool_member_entities(contents, pool, session)
            return _get_user_pool(user, session)

    def delete_from_pool(self, content_id: int, user: User) -> list[PoolMember]:
        with self._database_connection.session() as session:
            pool_member = _get_and_validate_member_to_delete(content_id, user, session)
            _delete_pool_member(pool_member, user, session)
            return _get_user_pool(user, session)

    def get_users_pools_main_user(self, user: User) -> User:
        with self._database_connection.session() as session:
            return session.scalar(
                select(User).where(
                    User.own_transient_pool.has(
                        or_(
                            Pool.owner_user_id == user.spotify_id,
                            Pool.joined_users.any(PoolJoinedUser.user_id == user.spotify_id),
                        )
                    )
                )
            )

    def get_pool_data(self, user: User) -> FullPoolData:
        with self._database_connection.session() as session:
            whole_pool = _get_user_pool(user, session)
            pool_users = self.get_pool_users(user)
            pool = _get_pool_for_user(user, session)
            is_playing = self.get_is_playing(pool)
            current_track = _get_current_track(pool, session)
        return (
            whole_pool,
            pool_users,
            is_playing,
            current_track,
            pool.share_data.code if pool.share_data is not None else None,
        )

    def get_is_playing(self, pool: Pool) -> bool:
        with self._database_connection.session() as session:
            playback_session = session.scalar(
                select(PlaybackSession).where(PlaybackSession.user_id == pool.owner_user_id)
            )
            if playback_session is None:
                return False
            return playback_session.is_active

    def get_pool(self, user: User) -> Pool:
        with self._database_connection.session() as session:
            return _get_pool_for_user(user, session)

    def get_playable_tracks(self, user: User) -> list[PoolMember]:
        with self._database_connection.session() as session:
            return _get_playable_tracks(user, session)

    def save_playback_status(
        self, user: User, playing_track: PoolMember, playback_end_timestamp: Optional[datetime.datetime] = None
    ) -> None:
        with self._database_connection.session() as session:
            existing_playback = session.scalar(
                select(PlaybackSession).where(PlaybackSession.user_id == user.spotify_id)
            )
            if existing_playback is not None and existing_playback.current_track_uri is not None:
                self._update_user_playback(existing_playback, playing_track, playback_end_timestamp)
            else:
                self._create_user_playback(session, user, playing_track)

            _update_skips_since_last_play(session, _get_pool_for_user(user, session), playing_track)
            _remove_played_promoted_songs(session, user, playing_track)

    def set_playback_is_active(self, user: User, is_active: bool) -> PoolFullContents:  # noqa: FBT001 - data flag
        with self._database_connection.session() as session:
            existing_playback = session.scalar(
                select(PlaybackSession).where(PlaybackSession.user_id == user.spotify_id)
            )
            if existing_playback is None:
                raise NotImplementedError
            existing_playback.is_active = is_active
        return self.get_pool_data(user)

    def _update_user_playback(
        self,
        existing_playback: PlaybackSession,
        playing_track: PoolMember,
        playback_end_timestamp: Optional[datetime.datetime] = None,
    ) -> None:
        existing_playback.current_track_id = playing_track.id if playing_track.id is not None else None
        existing_playback.current_track_name = playing_track.name
        existing_playback.current_track_uri = playing_track.content_uri
        existing_playback.current_track_image_url = playing_track.image_url
        existing_playback.current_track_duration = playing_track.duration_ms
        new_song_length = datetime.timedelta(milliseconds=playing_track.duration_ms)
        if playback_end_timestamp is None:
            new_end_time = self._datetime_wrapper.now() + new_song_length
        else:
            new_end_time = self._datetime_wrapper.ensure_utc(playback_end_timestamp) + new_song_length
        existing_playback.next_song_change_timestamp = new_end_time
        existing_playback.is_active = True

    def _create_user_playback(self, session: Session, user: User, playing_track: PoolMember) -> None:
        end_time = self._datetime_wrapper.now() + datetime.timedelta(milliseconds=playing_track.duration_ms)
        session.add(
            PlaybackSession(
                current_track_id=playing_track.id,
                next_song_change_timestamp=end_time,
                user_id=user.spotify_id,
                current_track_uri=playing_track.content_uri,
                current_track_name=playing_track.name,
                current_track_image_url=playing_track.image_url,
                current_track_duration_ms=playing_track.duration_ms,
            )
        )

    def get_playbacks_to_update(self) -> list[PlaybackSession]:
        cutoff_delta = datetime.timedelta(milliseconds=_PLAYBACK_UPDATE_CUTOFF_MS)
        cutoff_time = self._datetime_wrapper.now() + cutoff_delta
        with self._database_connection.session() as session:
            return (
                session.scalars(
                    select(PlaybackSession).where(
                        and_(PlaybackSession.is_active, PlaybackSession.next_song_change_timestamp < cutoff_time)
                    )
                )
                .unique()
                .all()
            )

    def set_playback_as_inactive(self, playback: PlaybackSession) -> None:
        with self._database_connection.session() as session:
            playback = session.scalar(select(PlaybackSession).where(PlaybackSession.user_id == playback.user_id))
            playback.is_active = False

    def get_pool_users(self, user: User) -> list[User]:
        with self._database_connection.session() as session:
            pool = session.scalar(
                select(Pool).where(
                    or_(
                        Pool.owner_user_id == user.spotify_id,
                        Pool.joined_users.any(PoolJoinedUser.user_id == user.spotify_id),
                    )
                )
            )
            return (
                session.scalars(
                    select(User)
                    .where(
                        or_(
                            User.spotify_id == pool.owner_user_id,
                            User.joined_pool.has(PoolJoinedUser.pool_id == pool.id),
                        )
                    )
                    .options(joinedload(User.joined_pool))
                )
                .unique()
                .all()
            )

    def share_pool(self, user: User) -> FullPoolData:
        share_code = create_random_string(8).upper()
        with self._database_connection.session() as session:
            pool = session.scalar(select(Pool).where(Pool.owner_user_id == user.spotify_id))
            if pool is None:
                raise HTTPException(status_code=404, detail=f"Could not find pool for user {user.spotify_username}")
            if pool.share_data is not None:
                raise HTTPException(status_code=400, detail="Pool already shared!")
            pool.share_data = PoolShareData(code=share_code)
        return self.get_pool_data(user)

    def join_pool(self, user: User, code: str) -> FullPoolData:
        with self._database_connection.session() as session:
            pool = session.scalar(select(Pool).where(Pool.share_data.has(PoolShareData.code == code)))
            _validate_pool_join(pool, user, code)
            _purge_existing_transient_pool(map_user_entity_to_model(user), session)
            pool.joined_users.append(PoolJoinedUser(user_id=user.spotify_id))
        return self.get_pool_data(user)

    def get_current_track(self, user: User) -> PoolTrack | None:
        with self._database_connection.session() as session:
            pool = _get_pool_for_user(user, session)
            return _get_current_track(pool, session)

    def save_playtime(self, user: User) -> None:
        with self._database_connection.session() as session:
            existing_playback: PlaybackSession = session.scalar(
                select(PlaybackSession).where(PlaybackSession.user_id == user.spotify_id)
            )
            # Track not set by Stagnum, but due to user error - using both Spotify and Stagnum controls
            if existing_playback.current_track is None:
                return
            played_user: PoolJoinedUser = session.scalar(
                select(PoolJoinedUser).where(PoolJoinedUser.user_id == existing_playback.current_track.user_id)
            )
            played_pool_member: PoolMember = session.scalar(
                select(PoolMember).where(PoolMember.id == existing_playback.current_track.id)
            )
            existing_end_time_utc = self._datetime_wrapper.ensure_utc(existing_playback.next_song_change_timestamp)
            delta: datetime.timedelta = max(
                existing_end_time_utc - self._datetime_wrapper.now(), datetime.timedelta(milliseconds=0)
            )
            playtime = existing_playback.current_track.duration_ms - delta / datetime.timedelta(milliseconds=1)
            session.add(
                PlayedPoolMember(
                    pool_member_id=played_pool_member.id, joined_user_id=played_user.user_id, played_time_ms=playtime
                )
            )

    def get_pool_for_playback_session(self, playback_session: PlaybackSession) -> Pool:
        with self._database_connection.session() as session:
            return session.scalar(select(Pool).where(Pool.owner_user_id == playback_session.user_id))

    def update_playback_ts(self, playback_session: PlaybackSession, new_timestamp: datetime.datetime) -> None:
        with self._database_connection.session() as session:
            session.add(playback_session)
            playback_session.next_song_change_timestamp = new_timestamp

    def save_unexpected_track_change(
        self, playback: PlaybackSession, new_track: PoolMember, end_timestamp: datetime.datetime
    ) -> None:
        with self._database_connection.session() as session:
            session.add(playback)
            playback.current_track = None
            playback.current_track_uri = new_track.content_uri
            playback.current_track_name = new_track.name
            playback.current_track_image_url = new_track.image_url
            playback.current_track_duration_ms = new_track.duration_ms
            playback.next_song_change_timestamp = end_timestamp

    def stop_and_purge_playback(self, user: User) -> list[User]:
        with self._database_connection.session() as session:
            users = self.get_pool_users(user)
            _purge_playback_users_pools(users, session)
            session.execute(delete(PlaybackSession).where(PlaybackSession.user_id == user.spotify_id))
        return users

    def leave_pool(self, user: User) -> FullPoolData:
        with self._database_connection.session() as session:
            pool_main_user = self.get_users_pools_main_user(user)
            _purge_existing_transient_pool(map_user_entity_to_model(user), session)
            session.commit()
            return self.get_pool_data(pool_main_user)

    def promote_track(self, track_id: str, user: User) -> list[PoolMember]:
        with self._database_connection.session() as session:
            pool = _get_pool_for_user(user, session)
            _promote_user_track(session, track_id, user, pool)
            return _get_user_pool(user, session)

    def depromote_track(self, user: User) -> list[PoolMember]:
        with self._database_connection.session() as session:
            _depromote_user_track(session, user)
            return _get_user_pool(user, session)

    def get_user_playtimes(
        self, users: list[User], cutoff_timedelta: datetime.timedelta = datetime.timedelta(hours=1)
    ) -> dict[str, int]:
        cutoff_time = self._datetime_wrapper.now() - cutoff_timedelta
        with self._database_connection.session() as session:
            playtime_raw_mapping = (
                session.query(
                    PlayedPoolMember.joined_user_id, func.sum(PlayedPoolMember.played_time_ms).label("playtime_ms")
                )
                .filter(
                    and_(
                        PlayedPoolMember.joined_user_id.in_([user.spotify_id for user in users]),
                        PlayedPoolMember.insert_time_stamp >= cutoff_time,
                    )
                )
                .group_by(PlayedPoolMember.joined_user_id)
            )
            return dict(playtime_raw_mapping)


PoolDatabaseConnection = Annotated[PoolDatabaseConnectionRaw, Depends()]


class WebsocketUpdaterRaw:
    _sockets: ClassVar[dict[str, WebSocket]] = {}

    def add_socket(self, websocket: WebSocket, user: User) -> None:
        self._sockets[user.spotify_id] = websocket

    async def push_update(
        self, user_ids: list[str], model: Literal["error", "current_track", "pool"], json: dict
    ) -> None:
        for user_id in user_ids:
            if user_id not in self._sockets:
                continue
            websocket_event = {"type": model, "model": json}
            await self._sockets[user_id].send_json(websocket_event)

    def remove_socket(self, user: User) -> None:
        self._sockets.pop(user.spotify_id)


WebsocketUpdater = Annotated[WebsocketUpdaterRaw, Depends()]


def _get_additional_queue_part(queue_data: dict) -> list[dict]:
    last_song_uri = queue_data["queue"][-1]["uri"]
    additional_queue_part = []
    for track_data in queue_data["queue"]:
        if track_data["uri"] == last_song_uri:
            break
        additional_queue_part.append(track_data)

    _logger.info(f"User queue: {additional_queue_part}")

    return additional_queue_part


def _validate_spotify_state(spotify_state: dict[str, Any] | None) -> bool:
    if not spotify_state:
        raise HTTPException(status_code=400, detail="Could not find active playback")
    if not spotify_state["is_playing"]:
        raise HTTPException(
            status_code=400, detail="Your playback is paused, please resume playback to continue using Stagnum!"
        )
    if spotify_state["context"] is not None:
        raise HTTPException(
            status_code=400,
            detail="Spotify playback moved to another context outside Stagnum control!"
            " Please restart playback from Stagnum by creating another pool.",
        )
    return True


class PoolPlaybackServiceRaw:
    def __init__(
        self,
        database_connection: PoolDatabaseConnection,
        spotify_client: PoolSpotifyClient,
        token_holder: TokenHolder,
        next_song_provider: NextSongProvider,
        datetime_wrapper: DateTimeWrapper,
        websocket_updater: WebsocketUpdater,
    ) -> None:
        self._database_connection = database_connection
        self._spotify_client = spotify_client
        self._token_holder = token_holder
        self._next_song_provider = next_song_provider
        self._datetime_wrapper = datetime_wrapper
        self._websocket_updater = websocket_updater

    def start_playback(self, user: User) -> PoolTrack:
        all_tracks = self._database_connection.get_playable_tracks(user)
        users = self._database_connection.get_pool_users(user)
        user_playtime_mappings = self._database_connection.get_user_playtimes(users)
        next_track = self._next_song_provider.select_next_song(all_tracks, users, user_playtime_mappings)
        self._spotify_client.start_playback(user, next_track.content_uri)
        self._database_connection.save_playback_status(user, next_track)
        return map_pool_member_entity_to_model(next_track)

    async def update_user_playbacks(self) -> None:
        active_playbacks = self._database_connection.get_playbacks_to_update()
        for playback in active_playbacks:
            await self._update_playback(playback)

    async def _update_playback(self, playback: PlaybackSession) -> None:
        if not self._token_holder.is_user_logged_in(playback.user_id):
            self._database_connection.set_playback_as_inactive(playback)
            return
        user = self._token_holder.get_user_from_user_id(playback.user_id)
        spotify_playback_end_timestamp = await self._get_spotify_playback_timestamp(playback, user)
        if spotify_playback_end_timestamp is not None:
            _logger.info(f"Updating playback for user {user.spotify_username}")
            skipped_queue = await self._fix_queue(user)
            await self._queue_next_song(user, spotify_playback_end_timestamp)
            if skipped_queue:
                self._spotify_client.skip_current_song(user)

    async def _queue_next_song(
        self, user: User, playback_end_timestamp: Optional[datetime.datetime] = None
    ) -> PoolMember:
        playable_tracks = self._database_connection.get_playable_tracks(user)
        pool_owner = self._database_connection.get_users_pools_main_user(user)
        self._database_connection.save_playtime(pool_owner)
        next_song = self._get_next_track(playable_tracks, user)
        _logger.info(f"Adding song {next_song.name} to queue for user {user.spotify_username}")
        self._spotify_client.set_next_song(user, next_song.content_uri)
        await self._playback_updated(pool_owner, next_song)
        self._database_connection.save_playback_status(pool_owner, next_song, playback_end_timestamp)
        return next_song

    async def _playback_updated(self, pool_owner: User, new_track: PoolMember) -> None:
        pool_user_ids = [user.spotify_id for user in self._database_connection.get_pool_users(pool_owner)]
        await self._websocket_updater.push_update(
            pool_user_ids, "current_track", map_unsaved_pool_member_entity_to_model(new_track).model_dump()
        )

    def _get_next_track(self, playable_tracks: list[PoolMember], user: User) -> PoolMember:
        users = self._database_connection.get_pool_users(user)
        user_playtime_mappings = self._database_connection.get_user_playtimes(users)
        return self._next_song_provider.select_next_song(playable_tracks, users, user_playtime_mappings)

    async def skip_song(self, user: User) -> UnsavedPoolTrack:
        self._fetch_and_validate_spotify_state(user)
        await self._fix_queue(user)
        next_song = await self._queue_next_song(user)
        self._spotify_client.skip_current_song(user)
        return UnsavedPoolTrack(
            name=next_song.name,
            spotify_icon_uri=next_song.image_url,
            spotify_resource_uri=next_song.content_uri,
            duration_ms=next_song.duration_ms,
        )

    async def pause_playback(self, user: User) -> PoolFullContents:
        self._spotify_client.stop_playback(user)
        return await self._inactivate_playback_session(user)

    async def _inactivate_playback_session(self, user: User) -> PoolFullContents:
        pool_data = self._database_connection.set_playback_is_active(user, False)  # noqa: FBT003
        pool_model = create_pool_return_model(*pool_data)
        user_ids = [user.user.spotify_id for user in pool_model.users]
        await self._websocket_updater.push_update(user_ids, "pool", pool_model.model_dump())
        return pool_model

    async def resume_playback(self, user: User) -> PoolFullContents:
        pool_data = self._database_connection.set_playback_is_active(user, True)  # noqa: FBT003
        pool_model = create_pool_return_model(*pool_data)
        pool_model.currently_playing = self.start_playback(user)
        user_ids = [user.user.spotify_id for user in pool_model.users]
        await self._websocket_updater.push_update(user_ids, "pool", pool_model.model_dump())
        return pool_model

    async def _get_spotify_playback_timestamp(self, playback: PlaybackSession, user: User) -> datetime.datetime | None:
        fetch_start = self._datetime_wrapper.now()
        try:
            spotify_state = self._fetch_and_validate_spotify_state(user)
        except HTTPException:
            await self._inactivate_playback_session(user)
            return None
        fetch_end = self._datetime_wrapper.now()
        song_left_at_fetch = spotify_state["item"]["duration_ms"] - spotify_state["progress_ms"]
        fetch_timestamp = ((fetch_end - fetch_start) / 2) + fetch_start
        fetch_lag = self._datetime_wrapper.now() - fetch_timestamp
        song_left = song_left_at_fetch - (fetch_lag / datetime.timedelta(milliseconds=1))
        new_end_timestamp = self._datetime_wrapper.now() + datetime.timedelta(milliseconds=song_left)
        if song_left < _PLAYBACK_UPDATE_CUTOFF_MS:
            return new_end_timestamp
        if spotify_state["item"]["uri"] != playback.current_track_uri:
            next_track = await self._fix_playback_data(playback, spotify_state["item"], new_end_timestamp)
            await self._playback_updated(user, next_track)
        else:
            self._database_connection.update_playback_ts(playback, new_end_timestamp)
        return None

    def _fetch_and_validate_spotify_state(self, user: User) -> dict:
        spotify_state = self._spotify_client.get_user_playback(user)
        _validate_spotify_state(spotify_state)
        return spotify_state

    async def _fix_playback_data(
        self, playback: PlaybackSession, actual_song_data: dict[str, Any], end_timestamp: datetime.datetime
    ) -> PoolMember:
        new_track = PoolMember(
            name=actual_song_data["name"],
            content_uri=actual_song_data["uri"],
            image_url=get_sharpest_icon(actual_song_data["album"]["images"]),
            duration_ms=actual_song_data["duration_ms"],
        )
        self._database_connection.save_unexpected_track_change(playback, new_track, end_timestamp)
        return new_track

    async def _fix_queue(self, user: User) -> bool:
        has_skipped_songs = False
        queue_data = _get_additional_queue_part(self._spotify_client.get_user_queue(user))
        while len(queue_data) > 0:
            has_skipped_songs = True
            for track_data in queue_data:
                _logger.info(f"Skipping track {track_data['name']} from user {user.spotify_username} queue.")
                self._spotify_client.skip_current_song(user)
            queue_data = _get_additional_queue_part(self._spotify_client.get_user_queue(user))

        return has_skipped_songs


PoolPlaybackService = Annotated[PoolPlaybackServiceRaw, Depends()]
