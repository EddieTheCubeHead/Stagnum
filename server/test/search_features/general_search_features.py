import random

import pytest


@pytest.fixture
def create_mock_track_search_result(faker):
    def wrapper():
        album_name = faker.text(max_nb_chars=25)[:-1]
        album_id = faker.sha1()
        track_name = faker.text(max_nb_chars=25)[:-1]
        print(album_name, album_id, track_name)
        return {
            "album": {
                "album_type": "normal",
                "total_tracks": random.randint(4, 20),
                "available_markets": ["FI"],
                "external_urls": {
                    "spotify": f"https://album.url.spotify.com/{album_id}"
                },
                "href": f"https://spotify.api/{album_id}"
            }
        }

    return wrapper


@pytest.fixture
def mock_spotify_general_search(requests_client):
    def wrapper():
        pass

    return wrapper


def should_return_spotify_get_search_data_from_search(create_mock_track_search_result):
    create_mock_track_search_result()
