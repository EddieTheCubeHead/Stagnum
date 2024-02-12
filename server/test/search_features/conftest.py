import random

import pytest

_DATE_PATTERN = "%Y-%m"


@pytest.fixture
def create_mock_artist_search_result(faker):
    def wrapper():
        artist_name = faker.name()
        artist_id = faker.uuid4()
        return {
            "external_urls": {
                "spotify": f"https://artist.url.spotify.com/{artist_id}"
            },
            "followers": {
                "href": f"spotify:artist_followers:{artist_id}",
                "total": random.randint(1, 999_999_999)
            },
            "genres": ["Prog rock"],
            "href": f"https://spotify.api/resource:artist:{artist_id}",
            "id": artist_id,
            "images": [
                {
                    "url": f"https://pic.spotify.url/{artist_name}",
                    "height": 300,
                    "width": 300
                }
            ],
            "name": artist_name,
            "popularity": random.randint(1, 10),
            "type": "artist",
            "uri": f"spotify:artist:{artist_id}"
        }
    return wrapper


@pytest.fixture
def create_mock_album_search_result(faker, create_mock_artist_search_result):

    def wrapper(artist):
        album_name = faker.text(max_nb_chars=25)[:-1]
        album_id = faker.uuid4()
        album_release_date = faker.date(pattern=_DATE_PATTERN)
        return {
            "album_type": "normal",
            "total_tracks": random.randint(4, 20),
            "available_markets": ["FI"],
            "external_urls": {
                "spotify": f"https://album.url.spotify.com/{album_id}"
            },
            "href": f"https://spotify.api/resource:album:{album_id}",
            "id": album_id,
            "images": [
                {
                    "url": f"https://pic.spotify.url/{album_name}",
                    "height": 300,
                    "width": 300
                }
            ],
            "name": album_name,
            "release_date": album_release_date,
            "release_date_precision": "year",
            "restrictions": {
                "reason": "market"
            },
            "type": "album",
            "uri": f"spotify:album:{album_id}",
            "artists": [
                {
                    "external_urls": artist["external_urls"],
                    "href": artist["href"],
                    "id": artist["id"],
                    "name": artist["name"],
                    "type": "artist",
                    "uri": artist["uri"]
                },
            ]
        }
    return wrapper


@pytest.fixture
def create_mock_track_search_result(faker, create_mock_artist_search_result, create_mock_album_search_result):
    def wrapper():
        track_name = faker.text(max_nb_chars=25)[:-1]
        track_id = faker.uuid4()
        artist = create_mock_artist_search_result()
        album = create_mock_album_search_result(artist)
        return {
            "album": album,
            "artists": [artist],
            "available_markets": ["FI"],
            "disc_number": 0,
            "duration_ms": random.randint(60_000, 600_000),
            "explicit": random.choice((True, False)),
            "external_ids": {
                "isrc": f"isrc:{track_id}",
                "ean": f"ean:{track_id}",
                "upc": f"upc:{track_id}"
            },
            "external_urls": {
                "spotify": f"https://track.url.spotify/{track_id}"
            },
            "href": f"https://spotify.api/resource:track:{track_id}",
            "id": track_id,
            "is_playable": True,
            "linked_from": {},
            "restrictions": {
                "reason": "market"
            },
            "name": track_name,
            "popularity": random.randint(1, 10),
            "preview_url": f"https://track.preview.spotify/{track_id}",
            "track_number": random.randint(1, album["total_tracks"]),
            "type": "track",
            "uri": f"spotify:track:{track_id}",
            "is_local": False
        }

    return wrapper


@pytest.fixture
def create_mock_playlist_search_result(faker):
    def wrapper():
        playlist_id = faker.uuid4()
        playlist_name = faker.text(max_nb_chars=25)[:-1]
        playlist_owner = faker.name()
        playlist_owner_id = faker.uuid4()
        return {
            "collaborative": random.choice((True, False)),
            "description": faker.paragraph(nb_sentences=2),
            "external_urls": {
                "spotify": f"https://playlist.url.spotify/{playlist_id}"
            },
            "href": f"https://spotify.api/resource:playlist:{playlist_id}",
            "id": playlist_id,
            "images": [
                {
                    "url": f"https://pic.spotify.url/{playlist_name}",
                    "height": 300,
                    "width": 300
                }
            ],
            "name": playlist_name,
            "owner": {
                "external_urls": {
                    "spotify": f"https://user.url.spotify/{playlist_owner}"
                },
                "followers": {
                    "href": f"https://spotify.api/resource:followers:{playlist_owner_id}",
                    "total": random.randint(1, 999)
                },
                "href": f"https://spotify.api/resource:user:{playlist_owner_id}",
                "id": playlist_owner_id,
                "type": "user",
                "uri": f"spotify:user:{playlist_owner_id}",
                "display_name": playlist_owner
            },
            "public": random.choice((True, False)),
            "snapshot_id": faker.uuid4(),
            "tracks": {
                "href": f"https://spotify.api/resource:playlist_tracks:{playlist_id}",
                "total": random.randint(1, 5000)
            },
            "type": "playlist",
            "uri": f"spotify:playlist:{playlist_id}"
        }

    return wrapper


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
