from api.pool.models import Pool, PoolTrack, PoolCollection
from database.entities import PoolMember


def _create_collection_tracks(collection: PoolMember) -> list[PoolTrack]:
    return [PoolTrack(name=track.name, spotify_icon_uri=collection.image_url, spotify_track_uri=track.content_uri)
            for track in collection.children]


def create_pool_return_model(pool: list[PoolMember]) -> Pool:
    tracks = []
    collections = []
    for pool_member in pool:
        if pool_member.content_uri.split(":")[1] == "track":
            tracks.append(PoolTrack(name=pool_member.name, spotify_icon_uri=pool_member.image_url,
                                    spotify_track_uri=pool_member.content_uri))
        else:
            collections.append(PoolCollection(name=pool_member.name, spotify_icon_uri=pool_member.image_url,
                                              tracks=_create_collection_tracks(pool_member),
                                              spotify_collection_uri=pool_member.content_uri))
    return Pool(tracks=tracks, collections=collections)
