import random

import httpx
import pytest
from api.common.spotify_models import PaginatedSearchResultData, SpotifyResourceData
from api.search.spotify_models import GeneralSearchResultData
from starlette.testclient import TestClient
from test_types.aliases import MockResponseQueue
from test_types.callables import (
    BuildSuccessResponse,
    CreateGeneralSearch,
    CreatePaginatedSearchResult,
    CreateSearchResponse,
    MockAlbumSearchResult,
    MockArtistSearchResult,
    MockPlaylistSearchResult,
    MockTrackSearchResult,
    RunSearchCall,
    ValidatePaginatedResultLength,
)
from test_types.typed_dictionaries import Headers


@pytest.fixture
def validate_paginated_result_length() -> ValidatePaginatedResultLength:
    def wrapper(result: PaginatedSearchResultData, length: int = 20, offset: int = 0) -> None:
        assert len(result["items"]) == length
        assert result["limit"] == length
        assert result["offset"] == offset

    return wrapper


@pytest.fixture
def create_paginated_search_result() -> CreatePaginatedSearchResult:
    def wrapper[T: SpotifyResourceData](
        query: str, result_count: int, items: list[T], nulls_appended: int = 0
    ) -> PaginatedSearchResultData[T]:
        return {
            "href": f"https://api.spotify.com/v1/search?query={query}&type=track&offset=0&limit=20",
            "limit": result_count + nulls_appended,
            "next": f"https://api.spotify.com/v1/search?query={query}&type=track&offset=20&limit=20",
            "offset": 0,
            "previous": None,
            "total": random.randint(20, 999),
            "items": items,
        }

    return wrapper


@pytest.fixture
def create_album_paginated_search(
    create_mock_album_search_result: MockAlbumSearchResult,
    create_paginated_search_result: CreatePaginatedSearchResult,
    create_mock_artist_search_result: MockArtistSearchResult,
    build_success_response: BuildSuccessResponse,
) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20, nulls_appended: int = 0) -> httpx.Response:
        artists = [create_mock_artist_search_result() for _ in range(limit)]
        albums = [create_mock_album_search_result(artist) for artist in artists] + [None for _ in range(nulls_appended)]
        return_json = {"albums": create_paginated_search_result(query, limit, albums)}
        return build_success_response(return_json)

    return wrapper


@pytest.fixture
def create_artist_paginated_search(
    create_mock_artist_search_result: MockArtistSearchResult,
    create_paginated_search_result: CreatePaginatedSearchResult,
    build_success_response: BuildSuccessResponse,
) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20, nulls_appended: int = 0) -> httpx.Response:
        artists = [create_mock_artist_search_result() for _ in range(limit)] + [None for _ in range(nulls_appended)]
        return_json = {"artists": create_paginated_search_result(query, limit, artists)}
        return build_success_response(return_json)

    return wrapper


@pytest.fixture
def create_playlist_paginated_search(
    create_mock_playlist_search_result: MockPlaylistSearchResult,
    create_paginated_search_result: CreatePaginatedSearchResult,
    build_success_response: BuildSuccessResponse,
) -> CreateSearchResponse:
    def wrapper(query: str, result_count: int = 20, nulls_appended: int = 0) -> httpx.Response:
        playlists = [create_mock_playlist_search_result() for _ in range(result_count)] + [
            None for _ in range(nulls_appended)
        ]
        return_json = {"playlists": create_paginated_search_result(query, result_count, playlists)}
        return build_success_response(return_json)

    return wrapper


@pytest.fixture
def create_track_paginated_search(
    create_mock_track_search_result: MockTrackSearchResult,
    create_paginated_search_result: CreatePaginatedSearchResult,
    build_success_response: BuildSuccessResponse,
) -> CreateSearchResponse:
    def wrapper(query: str, limit: int = 20, nulls_appended: int = 0) -> httpx.Response:
        tracks = [create_mock_track_search_result() for _ in range(limit)] + [None for _ in range(nulls_appended)]
        return_json = {"tracks": create_paginated_search_result(query, limit, tracks)}
        return build_success_response(return_json)

    return wrapper


@pytest.fixture
def build_spotify_general_search(
    create_mock_album_search_result: MockAlbumSearchResult,
    create_mock_playlist_search_result: MockPlaylistSearchResult,
    create_mock_artist_search_result: MockArtistSearchResult,
    create_mock_track_search_result: MockTrackSearchResult,
    create_paginated_search_result: CreatePaginatedSearchResult,
) -> CreateGeneralSearch:
    def wrapper(query: str, result_count: int = 20, nulls_appended: int = 0) -> GeneralSearchResultData:
        artists = [create_mock_artist_search_result() for _ in range(result_count)] + [
            None for _ in range(nulls_appended)
        ]
        tracks = [create_mock_track_search_result() for _ in range(result_count)] + [
            None for _ in range(nulls_appended)
        ]
        albums = [create_mock_album_search_result(artist) for artist in artists] + [None for _ in range(nulls_appended)]
        playlists = [create_mock_playlist_search_result() for _ in range(result_count)] + [
            None for _ in range(nulls_appended)
        ]
        return {
            "tracks": create_paginated_search_result(query, result_count, tracks, nulls_appended),
            "artists": create_paginated_search_result(query, result_count, artists, nulls_appended),
            "albums": create_paginated_search_result(query, result_count, albums, nulls_appended),
            "playlists": create_paginated_search_result(query, result_count, playlists, nulls_appended),
        }

    return wrapper


@pytest.fixture
def build_spotify_general_search_response(
    build_spotify_general_search: CreateGeneralSearch, build_success_response: BuildSuccessResponse
) -> CreateSearchResponse:
    def wrapper(query: str, result_count: int = 20, nulls_appended: int = 0) -> httpx.Response:
        return build_success_response(build_spotify_general_search(query, result_count, nulls_appended))

    return wrapper


@pytest.fixture
def run_search_call(
    test_client: TestClient, valid_token_header: Headers, requests_client_get_queue: MockResponseQueue
) -> RunSearchCall:
    def wrapper(
        query_addition: str | None,
        response_mocker: CreateSearchResponse,
        query: str,
        result_count: int = 20,
        nulls_appended: int = 0,
    ) -> httpx.Response:
        query_addition = f"/{query_addition}" if query_addition is not None else ""
        requests_client_get_queue.append(response_mocker(query, result_count, nulls_appended))
        return test_client.get(f"/search{query_addition}?query={query}", headers=valid_token_header)

    return wrapper
