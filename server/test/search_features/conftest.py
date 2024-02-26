import random

import pytest


@pytest.fixture
def validate_paginated_result_length():
    def wrapper(result: dict, length=20, offset=0):
        assert len(result["results"]) == length
        assert result["limit"] == length
        assert result["offset"] == offset

    return wrapper


@pytest.fixture
def create_paginated_search_result():
    def wrapper(query: str, limit: int, items: list[dict]):
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
