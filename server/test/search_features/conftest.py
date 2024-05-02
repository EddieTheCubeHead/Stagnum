import random
from typing import Callable, Any, Protocol

import pytest


class _ValidatePaginatedResultLengthProtocol(Protocol):
    def __call__(self, result: dict[str, Any], length: int = ..., offset: int = ...) -> None:
        ...


validate_paginated_result_length_callable = _ValidatePaginatedResultLengthProtocol


@pytest.fixture
def validate_paginated_result_length() -> validate_paginated_result_length_callable:
    def wrapper(result: dict, length: int = 20, offset: int = 0) -> None:
        assert len(result["results"]) == length
        assert result["limit"] == length
        assert result["offset"] == offset

    return wrapper


create_paginated_search_result_callable = Callable[[str, int, list[dict[str, Any]]], dict[str, Any]]


@pytest.fixture
def create_paginated_search_result() -> create_paginated_search_result_callable:
    def wrapper(query: str, limit: int, items: list[dict[str, Any]]) -> dict[str, Any]:
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
