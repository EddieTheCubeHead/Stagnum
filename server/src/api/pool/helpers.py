from logging import getLogger

from database.entities import PoolMember, User

from api.common.helpers import map_user_entity_to_joined_user_model
from api.pool.models import PoolCollection, PoolFullContents, PoolTrack, PoolUserContents, UnsavedPoolTrack

_logger = getLogger("main.api.pool.helpers")


def _create_collection_tracks(collection: PoolMember) -> list[PoolTrack]:
    return [
        PoolTrack(
            id=track.id,
            name=track.name,
            spotify_icon_uri=track.image_url,
            spotify_resource_uri=track.content_uri,
            duration_ms=track.duration_ms,
        )
        for track in collection.children
    ]


def create_pool_return_model(
    pool: list[PoolMember],
    users: list[User],
    is_active: bool,  # noqa: FBT001 - this is a data parameter, not a behavioural one
    current_track: PoolTrack | None,
    share_code: str | None = None,
) -> PoolFullContents:
    _logger.debug(f"Creating pool return model from {len(pool)} members.")
    users_map = {}
    pool_owner = None
    for user in users:
        user_model = map_user_entity_to_joined_user_model(user)
        users_map[user.spotify_id] = PoolUserContents(tracks=[], collections=[], user=user_model)
        if user.joined_pool.pool.owner_user_id == user.spotify_id:
            pool_owner = user_model
    for pool_member in pool:
        member_owner = users_map[pool_member.user_id]
        if pool_member.content_uri.split(":")[1] == "track":
            member_owner.tracks.append(
                PoolTrack(
                    id=pool_member.id,
                    name=pool_member.name,
                    spotify_icon_uri=pool_member.image_url,
                    spotify_resource_uri=pool_member.content_uri,
                    duration_ms=pool_member.duration_ms,
                )
            )
        else:
            member_owner.collections.append(
                PoolCollection(
                    id=pool_member.id,
                    name=pool_member.name,
                    spotify_icon_uri=pool_member.image_url,
                    tracks=_create_collection_tracks(pool_member),
                    spotify_resource_uri=pool_member.content_uri,
                )
            )
    return PoolFullContents(
        users=list(users_map.values()),
        share_code=share_code,
        is_active=is_active,
        currently_playing=current_track,
        owner=pool_owner,
    )


def map_pool_member_entity_to_model(pool_member: PoolMember) -> PoolTrack:
    return PoolTrack(
        id=pool_member.id,
        name=pool_member.name,
        spotify_icon_uri=pool_member.image_url,
        spotify_resource_uri=pool_member.content_uri,
        duration_ms=pool_member.duration_ms,
    )


def map_unsaved_pool_member_entity_to_model(pool_member: PoolMember) -> UnsavedPoolTrack:
    return UnsavedPoolTrack(
        name=pool_member.name,
        spotify_icon_uri=pool_member.image_url,
        spotify_resource_uri=pool_member.content_uri,
        duration_ms=pool_member.duration_ms,
    )
