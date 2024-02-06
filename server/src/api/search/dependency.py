from api.common.dependencies import SpotifyClient
from api.search.models import SpotifyPlayableType


class SearchSpotifyClientRaw:
    def __init__(self, spotify_client: SpotifyClient):
        self._spotify_client = spotify_client

    def get_search(self, query: str, token: str, types: list[SpotifyPlayableType], offset: int = 0, limit: int = 20):
        search_types = ",".join(playable_type.value for playable_type in types)
        headers = {
            "Authorization": token
        }
        query_string = f"search?q={query}&type={search_types}&offset={offset}&limit={limit}"
        result = self._spotify_client.get(query_string, headers=headers)
        pass
