import random

import httpx
import pytest
from _pytest.fixtures import FixtureRequest
from starlette.testclient import TestClient

from test_types.aliases import MockResponseQueue
from test_types.callables import ValidatePaginatedResultLength, CreatePaginatedSearchResult, MockAlbumSearchResult, \
    BuildSuccessResponse, MockArtistSearchResult, CreateSearchResponse, MockPlaylistSearchResult, MockTrackSearchResult, \
    CreateGeneralSearch, RunSearchCall
from test_types.typed_dictionaries import SpotifyResourceData, PaginatedSearchResultData, Headers


@pytest.fixture
def validate_paginated_result_length() -> ValidatePaginatedResultLength:
    def wrapper(result: PaginatedSearchResultData, length: int = 20, offset: int = 0) -> None:
        assert len(result["items"]) == length
        assert result["limit"] == length
        assert result["offset"] == offset

    return wrapper


@pytest.fixture
def create_paginated_search_result() -> CreatePaginatedSearchResult:
    def wrapper[T: SpotifyResourceData](query: str, limit: int, items: list[T]) -> PaginatedSearchResultData[T]:
        return {
            "href": f"https://api.spotify.com/v1/search?query={query}&type=track&offset=0&limit=20",
            "limit": limit,
            "next": f"https://api.spotify.com/v1/search?query={query}&type=track&offset=20&limit=20",
            "offset": 0,
            "previous": None,
            "total": random.randint(20, 999),
            "items": items
        }

    return wrapper


@pytest.fixture
def create_album_paginated_search(create_mock_album_search_result: MockAlbumSearchResult,
                                  create_paginated_search_result: CreatePaginatedSearchResult,
                                  create_mock_artist_search_result: MockArtistSearchResult,
                                  build_success_response: BuildSuccessResponse) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        artists = [create_mock_artist_search_result() for _ in range(limit)]
        albums = [create_mock_album_search_result(artist) for artist in artists]
        return_json = {
            "albums": create_paginated_search_result(query, limit, albums)
        }
        return build_success_response(return_json)

    return wrapper


@pytest.fixture
def create_artist_paginated_search(create_mock_artist_search_result: MockArtistSearchResult,
                                   create_paginated_search_result: CreatePaginatedSearchResult,
                                   build_success_response: BuildSuccessResponse) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        artists = [create_mock_artist_search_result() for _ in range(limit)]
        return_json = {
            "artists": create_paginated_search_result(query, limit, artists)
        }
        return build_success_response(return_json)

    return wrapper


@pytest.fixture
def create_playlist_paginated_search(create_mock_playlist_search_result: MockPlaylistSearchResult,
                                     create_paginated_search_result: CreatePaginatedSearchResult,
                                     build_success_response: BuildSuccessResponse) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        playlists = [create_mock_playlist_search_result() for _ in range(limit)]
        return_json = {
            "playlists": create_paginated_search_result(query, limit, playlists)
        }
        return build_success_response(return_json)

    return wrapper


@pytest.fixture
def create_track_paginated_search(create_mock_track_search_result, create_paginated_search_result,
                                  build_success_response) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        tracks = [create_mock_track_search_result() for _ in range(limit)]
        return_json = {
            "tracks": create_paginated_search_result(query, limit, tracks)
        }
        return build_success_response(return_json)

    return wrapper


@pytest.fixture
def build_spotify_general_search(create_mock_album_search_result: MockAlbumSearchResult,
                                 create_mock_playlist_search_result: MockPlaylistSearchResult,
                                 create_mock_artist_search_result: MockArtistSearchResult,
                                 create_mock_track_search_result: MockTrackSearchResult,
                                 create_paginated_search_result: CreatePaginatedSearchResult) -> CreateGeneralSearch:
    def wrapper(query: str, limit: int = 20):
        artists = [create_mock_artist_search_result() for _ in range(limit)]
        tracks = [create_mock_track_search_result() for _ in range(limit)]
        albums = [create_mock_album_search_result(artist) for artist in artists]
        playlists = [create_mock_playlist_search_result() for _ in range(limit)]
        return {
            "tracks": create_paginated_search_result(query, limit, tracks),
            "artists": create_paginated_search_result(query, limit, artists),
            "albums": create_paginated_search_result(query, limit, albums),
            "playlists": create_paginated_search_result(query, limit, playlists)
        }

    return wrapper


@pytest.fixture
def build_spotify_general_search_response(build_spotify_general_search: CreateGeneralSearch,
                                          build_success_response: BuildSuccessResponse) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20) -> httpx.Response:
        return build_success_response(build_spotify_general_search(query, limit))

    return wrapper
