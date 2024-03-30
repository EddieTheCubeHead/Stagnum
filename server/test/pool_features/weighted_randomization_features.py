import random
from typing import Callable, Any
from unittest.mock import Mock

import pytest
from sqlalchemy import select

from api.pool.dependencies import PoolSpotifyClient
from api.pool.models import PoolContent, PoolCreationData
from api.pool.randomization_algorithms import RandomizationParameters
from database.entities import User, PoolMember, PoolMemberRandomizationParameters, PoolJoinedUser


@pytest.fixture(params=[RandomizationParameters(5, 60, 90), RandomizationParameters(10, 50, 75)])
def weighted_parameters(request, monkeypatch) -> RandomizationParameters:
    parameters: RandomizationParameters = request.param
    monkeypatch.setenv("CUSTOM_WEIGHT_SCALE", str(parameters.custom_weight_scale))
    monkeypatch.setenv("PSEUDO_RANDOM_FLOOR", str(parameters.pseudo_random_floor))
    monkeypatch.setenv("PSEUDO_RANDOM_CEILING", str(parameters.pseudo_random_ceiling))
    return parameters


@pytest.fixture
def create_test_users(faker, logged_in_user) -> Callable[[int], list[User]]:
    def wrapper(amount: int) -> list[User]:
        users = [logged_in_user]
        for num in range(1, amount):
            user = User(spotify_id=faker.uuid4(), spotify_username=faker.name(),
                              spotify_avatar_url=f"example.picture.url{num}")
            users.append(user)
        return users

    return wrapper


@pytest.fixture
def create_pool_from_users(faker) -> Callable[[tuple[tuple[User, int], ...]], dict[str, list[PoolMember]]]:
    def wrapper(*user_size_pairs: tuple[User, int]) -> dict[str, list[PoolMember]]:
        pool_id = random.randint(0, 999999)
        pool_members: dict[str, list[PoolMember]] = {}
        rolling_id = 0
        for user, size in user_size_pairs:
            pool_members[user.spotify_id] = []
            member_name = faker.text(max_nb_chars=25)[:-1]
            pool_member = (PoolMember(
                id=rolling_id,
                name=member_name,
                user_id=user.spotify_id,
                pool_id=pool_id,
                image_url=f"example.picture/{member_name}",
                content_uri=f"spotify:track:{faker.uuid4()}",
                duration_ms=random.randint(120000, 360000),
                sort_order=rolling_id,
                parent_id=None
            ))
            pool_member.randomization_parameters = PoolMemberRandomizationParameters(
                weight=0,
                skips_since_last_play=0
            )
            rolling_id += 1
            pool_members[user.spotify_id].append(pool_member)
        return pool_members

    return wrapper


@pytest.fixture
def mock_pool_member_spotify_fetch(requests_client, build_success_response) -> Callable[[PoolMember], None]:
    def wrapper(pool_member: PoolMember):
        response = {
            "duration_ms": pool_member.duration_ms,
            "is_playable": True,
            "name": pool_member.name,
            "album": {
                "images": [
                    {
                        "url": f"https://pic.spotify.url/{pool_member.name}album",
                        "height": 300,
                        "width": 300
                    }
                ]
            },
            "preview_url": pool_member.image_url,
            "type": "track",
            "uri": pool_member.content_uri
        }
        requests_client.get = Mock(return_value=build_success_response(response))

    return wrapper


@pytest.fixture
def create_member_post_data() -> Callable[[PoolMember], dict[str, Any]]:
    def wrapper(pool_member: PoolMember):
        return PoolContent(spotify_uri=pool_member.content_uri).model_dump()

    return wrapper


@pytest.fixture
def add_track_to_pool(mock_pool_member_spotify_fetch, create_member_post_data, test_client) \
        -> Callable[[PoolMember, dict[str, str]], None]:
    def wrapper(track: PoolMember, headers: dict[str, str]):
        mock_pool_member_spotify_fetch(track)
        post_data = create_member_post_data(track)
        test_client.post("/pool/content", json=post_data, headers=headers)

    return wrapper


@pytest.fixture
def implement_pool_from_members(test_client, create_token, log_user_in, create_header_from_token_response,
                                valid_token_header, create_member_post_data, add_track_to_pool,
                                share_pool_and_get_code, mock_pool_member_spotify_fetch) \
        -> Callable[[list[User], dict[str, list[PoolMember]]], None]:
    def wrapper(users: list[User], pool_members: dict[str, list[PoolMember]]):
        main_user = users[0]
        main_user_pool = pool_members[main_user.spotify_id]
        creation_data = PoolCreationData(spotify_uris=[create_member_post_data(main_user_pool[0])]).model_dump()
        mock_pool_member_spotify_fetch(main_user_pool[0])
        test_client.post("/pool", json=creation_data, headers=valid_token_header)
        share_code = share_pool_and_get_code()
        for track in main_user_pool[1:]:
            add_track_to_pool(track, valid_token_header)
        for user in users[1:]:
            token = create_token()
            log_user_in(user, token)
            header = create_header_from_token_response(token)
            test_client.post(f"/pool/join/{share_code}", headers=header)
            for track in pool_members[user.spotify_id]:
                add_track_to_pool(track, header)

    return wrapper


@pytest.mark.slow
@pytest.mark.parametrize("existing_playback", [2], indirect=True)
def should_always_alternate_songs_in_two_song_queue(existing_playback, test_client, valid_token_header,
                                                    requests_client, get_query_parameter, weighted_parameters):
    assert len(existing_playback) == 2
    last_call_uri = None
    for _ in range(20):
        test_client.post("/pool/playback/skip", headers=valid_token_header)
        actual_queue_call = requests_client.post.call_args_list[-2]
        track_uri = get_query_parameter(actual_queue_call.args[0], "uri")
        assert last_call_uri != track_uri
        last_call_uri = track_uri


@pytest.mark.slow
def should_respect_custom_weight(next_song_provider, create_test_users, create_pool_from_users, weighted_parameters):
    users = create_test_users(1)
    users[0].joined_pool = PoolJoinedUser(playback_time_ms = 0)
    song_1_plays = 0
    song_2_plays = 0
    for _ in range(9999):
        pool = create_pool_from_users((users[0], 2))[users[0].spotify_id]
        pool[0].randomization_parameters.weight = 1
        song = next_song_provider.select_next_song(pool, users)
        if song.id == pool[0].id:
            song_1_plays += 1
        else:
            song_2_plays += 1
    assert song_2_plays * (weighted_parameters.custom_weight_scale - 0.1) < song_1_plays


@pytest.mark.slow
def should_balance_users_by_playtime(create_test_users, create_pool_from_users, weighted_parameters, test_client,
                                     valid_token_header, db_connection,
                                     implement_pool_from_members):
    users = create_test_users(9)
    pool = create_pool_from_users(*[(user, 10) for user in users])
    implement_pool_from_members(users, pool)
    for _ in range(999):
        test_client.post("/pool/playback/skip", headers=valid_token_header)
    with db_connection.session() as session:
        pool_users = session.scalars(select(PoolJoinedUser)).unique().all()
    pool_users_playtime = [user.playback_time_ms for user in pool_users]
    pool_users_playtime.sort()
    assert pool_users_playtime[0] / pool_users_playtime[-1] > 0.5
