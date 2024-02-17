from api.pool.models import Pool, PoolTrack, PoolCollection
from database.entities import PoolMember


def _create_collection_tracks(collection: PoolMember) -> list[PoolTrack]:
    return [PoolTrack(name=track.name, spotify_icon_uri=collection.image_url, spotify_content_uri=track.content_uri)
            for track in collection.children]


def create_pool_return_model(pool: list[PoolMember]) -> Pool:
    tracks = []
    collections = []
    for pool_member in pool:
        if pool_member.content_uri is not None:
            tracks.append(PoolTrack(name=pool_member.name, spotify_icon_uri=pool_member.image_url,
                                    spotify_track_uri=pool_member.content_uri))
        else:
            collections.append(PoolCollection(name=pool_member.name, spotify_icon_uri=pool_member.image_url,
                                              tracks=_create_collection_tracks(pool_member)))
    return Pool(tracks=tracks, collections=collections)
