from typing import TypedDict

from api.common.spotify_models import ImageData


class SpotifyFetchMeData(TypedDict):
    country: str
    display_name: str
    id: str
    images: list[ImageData]
    product: str
