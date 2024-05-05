import random

import pytest

from test_types.callables import CreatePaginatedResult, ValidatePaginatedResultLength
from test_types.typed_dictionaries import SpotifyResourceData, PaginatedSearchResultData


@pytest.fixture
def validate_paginated_result_length() -> ValidatePaginatedResultLength:
    def wrapper(result: PaginatedSearchResultData, length: int = 20, offset: int = 0) -> None:
        assert len(result["items"]) == length
        assert result["limit"] == length
        assert result["offset"] == offset

    return wrapper


@pytest.fixture
def create_paginated_search_result() -> CreatePaginatedResult:
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
