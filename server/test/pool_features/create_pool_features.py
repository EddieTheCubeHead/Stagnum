from unittest.mock import Mock, call

import pytest
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from starlette.testclient import TestClient

from database.database_connection import ConnectionManager
from database.entities import PoolMember


def should_create_pool_of_one_song_when_post_pool_called_with_single_song_id(test_client: TestClient,
                                                                             valid_token_header,
                                                                             validate_response,
                                                                             create_mock_track_search_result,
                                                                             build_success_response,
                                                                             requests_client,
                                                                             create_pool_creation_data_json):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client.get = Mock(return_value=build_success_response(my_track))
    response = test_client.post("/pool", json=data_json, headers=valid_token_header)
    pool_response = validate_response(response)
    assert pool_response["tracks"][0]["name"] == my_track["name"]


def should_save_pool_in_database_with_user_id_when_created(test_client: TestClient, db_connection: ConnectionManager,
                                                           valid_token_header, create_mock_track_search_result,
                                                           build_success_response, requests_client, logged_in_user_id,
                                                           create_pool_creation_data_json):
    my_track = create_mock_track_search_result()
    data_json = create_pool_creation_data_json(my_track["uri"])
    requests_client.get = Mock(return_value=build_success_response(my_track))
    test_client.post("/pool", json=data_json, headers=valid_token_header)
    with db_connection.session() as session:
        actual_pool_content = session.scalar(select(PoolMember).where(PoolMember.user_id == logged_in_user_id))
    assert actual_pool_content.duration_ms == my_track["duration_ms"]


def should_be_able_to_create_pool_from_album(test_client: TestClient, valid_token_header,
                                             create_mock_album_search_result, validate_response,
                                             create_mock_track_search_result, create_mock_artist_search_result,
                                             build_success_response, requests_client, create_pool_creation_data_json):
    artist = create_mock_artist_search_result()
    tracks = [create_mock_track_search_result(artist) for _ in range(12)]
    album = create_mock_album_search_result(artist, tracks)
    requests_client.get = Mock(return_value=build_success_response(album))
    data_json = create_pool_creation_data_json(album["uri"])

    result = test_client.post("/pool", json=data_json, headers=valid_token_header)

    requests_client.get.assert_called_with(f"https://api.spotify.com/v1/albums/{album['id']}",
                                           headers={"Authorization": valid_token_header["token"]})
    pool_response = validate_response(result)
    assert pool_response["tracks"] == []
    assert len(pool_response["collections"][0]["tracks"]) == len(tracks)
    for expected_track, actual_track in zip(tracks, pool_response["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_save_whole_album_as_pool_in_database(test_client: TestClient, valid_token_header, db_connection,
                                                create_mock_album_search_result, create_mock_track_search_result,
                                                create_mock_artist_search_result, build_success_response,
                                                requests_client, create_pool_creation_data_json, logged_in_user_id):
    artist = create_mock_artist_search_result()
    tracks = [create_mock_track_search_result(artist) for _ in range(12)]
    album = create_mock_album_search_result(artist, tracks)
    requests_client.get = Mock(return_value=build_success_response(album))
    data_json = create_pool_creation_data_json(album["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_parent = session.scalar(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children)))
    assert actual_parent.name == album["name"]
    assert len(actual_parent.children) == len(tracks)
    for expected_track, actual_track in zip(tracks, sorted(actual_parent.children, key=lambda x: x.sort_order)):
        assert actual_track.duration_ms == expected_track["duration_ms"]
        assert actual_track.name == expected_track["name"]


def should_be_able_to_create_pool_from_artist(test_client: TestClient, valid_token_header, validate_response,
                                              create_mock_track_search_result, create_mock_artist_search_result,
                                              build_success_response, requests_client, create_pool_creation_data_json):
    artist = create_mock_artist_search_result()
    tracks = {
        "tracks": [create_mock_track_search_result(artist) for _ in range(10)]
    }
    requests_client.get = Mock(side_effect=[build_success_response(artist), build_success_response(tracks)])
    data_json = create_pool_creation_data_json(artist["uri"])

    result = test_client.post("/pool", json=data_json, headers=valid_token_header)

    assert requests_client.get.call_args_list[0] == call(f"https://api.spotify.com/v1/artists/{artist['id']}",
                                                         headers={"Authorization": valid_token_header["token"]})
    assert (requests_client.get.call_args_list[1]
            == call(f"https://api.spotify.com/v1/artists/{artist['id']}/top-tracks",
                    headers={"Authorization": valid_token_header["token"]}))
    pool_response = validate_response(result)
    assert pool_response["tracks"] == []
    assert len(pool_response["collections"][0]["tracks"]) == len(tracks["tracks"])
    for expected_track, actual_track in zip(tracks["tracks"], pool_response["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_save_artist_top_ten_tracks_as_pool_in_database(test_client: TestClient, valid_token_header, db_connection,
                                                          create_mock_artist_search_result, requests_client,
                                                          create_mock_track_search_result, build_success_response,
                                                          create_pool_creation_data_json, logged_in_user_id):
    artist = create_mock_artist_search_result()
    tracks = {
        "tracks": [create_mock_track_search_result(artist) for _ in range(10)]
    }
    requests_client.get = Mock(side_effect=[build_success_response(artist), build_success_response(tracks)])
    data_json = create_pool_creation_data_json(artist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_parent = session.scalar(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children)))
    assert actual_parent.name == artist["name"]
    assert len(actual_parent.children) == len(tracks["tracks"])
    for expected_track, actual_track in zip(tracks["tracks"],
                                            sorted(actual_parent.children, key=lambda x: x.sort_order)):
        assert actual_track.duration_ms == expected_track["duration_ms"]
        assert actual_track.name == expected_track["name"]


def should_be_able_to_create_pool_from_playlist(test_client: TestClient, valid_token_header,
                                                create_mock_playlist_fetch_result, validate_response,
                                                create_mock_track_search_result, build_success_response,
                                                requests_client, create_pool_creation_data_json):
    playlist = create_mock_playlist_fetch_result(30)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    result = test_client.post("/pool", json=data_json, headers=valid_token_header)

    requests_client.get.assert_called_with(f"https://api.spotify.com/v1/playlists/{playlist['id']}",
                                           headers={"Authorization": valid_token_header["token"]})
    pool_response = validate_response(result)
    assert pool_response["tracks"] == []
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    assert len(pool_response["collections"][0]["tracks"]) == len(expected_tracks)
    for expected_track, actual_track in zip(expected_tracks, pool_response["collections"][0]["tracks"]):
        assert actual_track["name"] == expected_track["name"]


def should_save_whole_playlist_as_pool_in_database(test_client: TestClient, valid_token_header, db_connection,
                                                   create_mock_playlist_fetch_result, build_success_response,
                                                   requests_client, create_pool_creation_data_json, logged_in_user_id):
    playlist = create_mock_playlist_fetch_result(30)
    requests_client.get = Mock(return_value=build_success_response(playlist))
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_parent = session.scalar(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children)))
    assert actual_parent.name == playlist["name"]
    expected_tracks = [track["track"] for track in playlist["tracks"]["items"]]
    assert len(actual_parent.children) == len(expected_tracks)
    for expected_track, actual_track in zip(expected_tracks, sorted(actual_parent.children, key=lambda x: x.sort_order)):
        assert actual_track.name == expected_track["name"]
        assert actual_track.duration_ms == expected_track["duration_ms"]


def should_delete_previous_pool_on_post_pool_call(test_client: TestClient, valid_token_header, db_connection,
                                                  create_mock_album_search_result, create_mock_track_search_result,
                                                  create_mock_artist_search_result, build_success_response,
                                                  requests_client, create_pool_creation_data_json, logged_in_user_id):
    old_artist = create_mock_artist_search_result()
    old_tracks = [create_mock_track_search_result(old_artist) for _ in range(12)]
    old_album = create_mock_album_search_result(old_artist, old_tracks)
    requests_client.get = Mock(return_value=build_success_response(old_album))
    old_data_json = create_pool_creation_data_json(old_album["uri"])
    test_client.post("/pool", json=old_data_json, headers=valid_token_header)

    artist = create_mock_artist_search_result()
    tracks = [create_mock_track_search_result(artist) for _ in range(12)]
    album = create_mock_album_search_result(artist, tracks)
    requests_client.get = Mock(return_value=build_success_response(album))
    data_json = create_pool_creation_data_json(album["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_results = session.scalars(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children))).unique().all()
    assert len(actual_results) == 1


def should_be_able_to_post_multiple_pool_members_on_creation(test_client: TestClient, valid_token_header,
                                                             validate_response, create_mock_track_search_result,
                                                             build_success_response, requests_client,
                                                             create_pool_creation_data_json, db_connection,
                                                             create_mock_artist_search_result,
                                                             create_mock_album_search_result, logged_in_user_id,
                                                             create_mock_playlist_fetch_result):
    tracks = [create_mock_track_search_result() for _ in range(10)]
    artist = create_mock_artist_search_result()
    artist_tracks = {"tracks": [create_mock_track_search_result(artist) for _ in range(10)]}
    album = create_mock_album_search_result(artist, [create_mock_track_search_result(artist) for _ in range(12)])
    playlist = create_mock_playlist_fetch_result(23)
    responses = [build_success_response(track) for track in tracks]
    responses.extend([build_success_response(artist), build_success_response(artist_tracks),
                      build_success_response(album), build_success_response(playlist)])
    requests_client.get = Mock(side_effect=responses)
    data_json = create_pool_creation_data_json(*[track["uri"] for track in tracks], artist["uri"], album["uri"],
                                               playlist["uri"])

    response = test_client.post("/pool", json=data_json, headers=valid_token_header)

    pool_response = validate_response(response)
    assert len(pool_response["tracks"]) == len(tracks)
    assert len(pool_response["collections"]) == 3

    with db_connection.session() as session:
        actual_results = session.scalars(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                         .options(joinedload(PoolMember.children))).unique().all()
        assert len(actual_results) == len(tracks) + 3


def should_fetch_multiple_times_if_playlist_is_too_long_to_fetch_in_one_go(test_client: TestClient, valid_token_header,
                                                                           db_connection, requests_client,
                                                                           create_mock_playlist_fetch_result,
                                                                           build_success_response, logged_in_user_id,
                                                                           create_pool_creation_data_json):
    playlist_length = 320
    playlist_fetches = create_mock_playlist_fetch_result(playlist_length)
    playlist = playlist_fetches[0]
    responses = [build_success_response(data_point) for data_point in playlist_fetches]
    requests_client.get = Mock(side_effect=responses)
    data_json = create_pool_creation_data_json(playlist["uri"])

    test_client.post("/pool", json=data_json, headers=valid_token_header)

    with db_connection.session() as session:
        actual_parent = session.scalar(select(PoolMember).where(
            and_(PoolMember.user_id == logged_in_user_id, PoolMember.parent_id == None))
                                           .options(joinedload(PoolMember.children)))
    assert actual_parent.name == playlist["name"]
    assert len(actual_parent.children) == playlist_length
    assert requests_client.get.call_args.kwargs["headers"]["Authorization"] == valid_token_header["token"]
