from logging import getLogger

from database.entities import PoolMember, User

from api.common.helpers import map_user_entity_to_model
from api.pool.models import PoolCollection, PoolFullContents, PoolTrack, PoolUserContents

_logger = getLogger("main.api.pool.helpers")


def _create_collection_tracks(collection: PoolMember) -> list[PoolTrack]:
    return [
        PoolTrack(
            name=track.name,
            spotify_icon_uri=track.image_url,
            spotify_track_uri=track.content_uri,
            duration_ms=track.duration_ms,
        )
        for track in collection.children
    ]


def create_pool_return_model(
    pool: list[PoolMember], users: list[User], current_track: PoolTrack | None, share_code: str | None = None
) -> PoolFullContents:
    _logger.debug(f"Creating pool return model from {len(pool)} members.")
    users_map = {}
    pool_owner = None
    for user in users:
        user_model = map_user_entity_to_model(user)
        users_map[user.spotify_id] = PoolUserContents(tracks=[], collections=[], user=user_model)
        if user.joined_pool.pool.owner_user_id == user.spotify_id:
            pool_owner = user_model
    for pool_member in pool:
        if pool_member.content_uri.split(":")[1] == "track":
            users_map[pool_member.user_id].tracks.append(
                PoolTrack(
                    name=pool_member.name,
                    spotify_icon_uri=pool_member.image_url,
                    spotify_track_uri=pool_member.content_uri,
                    duration_ms=pool_member.duration_ms,
                )
            )
        else:
            users_map[pool_member.user_id].collections.append(
                PoolCollection(
                    name=pool_member.name,
                    spotify_icon_uri=pool_member.image_url,
                    tracks=_create_collection_tracks(pool_member),
                    spotify_collection_uri=pool_member.content_uri,
                )
            )
    return PoolFullContents(
        users=list(users_map.values()), share_code=share_code, currently_playing=current_track, owner=pool_owner
    )


def map_pool_member_entity_to_model(pool_member: PoolMember) -> PoolTrack:
    return PoolTrack(
        name=pool_member.name,
        spotify_icon_uri=pool_member.image_url,
        spotify_track_uri=pool_member.content_uri,
        duration_ms=pool_member.duration_ms,
    )
