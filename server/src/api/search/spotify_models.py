from typing import TypedDict

from api.common.spotify_models import AlbumData, ArtistData, PaginatedSearchResultData, PlaylistData, TrackData


class GeneralSearchResultData(TypedDict):
    tracks: PaginatedSearchResultData[TrackData]
    albums: PaginatedSearchResultData[AlbumData]
    artists: PaginatedSearchResultData[ArtistData]
    playlists: PaginatedSearchResultData[PlaylistData]
