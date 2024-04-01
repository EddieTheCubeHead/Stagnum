from logging import getLogger

from api.common.helpers import map_user_entity_to_model
from api.pool.models import PoolFullContents, PoolTrack, PoolCollection, PoolUserContents
from database.entities import PoolMember, User

_logger = getLogger("main.api.pool.helpers")


def _create_collection_tracks(collection: PoolMember) -> list[PoolTrack]:
    return [PoolTrack(name=track.name,
                      spotify_icon_uri=collection.image_url,
                      spotify_track_uri=track.content_uri,
                      duration_ms=track.duration_ms)
            for track in collection.children]


def create_pool_return_model(pool: list[PoolMember], users: list[User], current_track: PoolMember,
                             share_code: str | None = None) -> PoolFullContents:
    _logger.debug(f"Creating pool return model from {len(pool)} members.")
    users_map = {user.spotify_id: PoolUserContents(tracks=[],
                                                   collections=[],
                                                   user=map_user_entity_to_model(user))
                 for user in users}
    for pool_member in pool:
        if pool_member.content_uri.split(":")[1] == "track":
            users_map[pool_member.user_id].tracks.append(
                PoolTrack(name=pool_member.name, spotify_icon_uri=pool_member.image_url,
                          spotify_track_uri=pool_member.content_uri, duration_ms=pool_member.duration_ms))
        else:
            users_map[pool_member.user_id].collections.append(
                PoolCollection(name=pool_member.name, spotify_icon_uri=pool_member.image_url,
                               tracks=_create_collection_tracks(pool_member),
                               spotify_collection_uri=pool_member.content_uri))
    current_track_model = PoolTrack(name=current_track.name, spotify_icon_uri=current_track.image_url,
                                    spotify_track_uri=current_track.content_uri, duration_ms=current_track.duration_ms)
    return PoolFullContents(users=list(users_map.values()), share_code=share_code,
                            currently_playing=current_track_model)
