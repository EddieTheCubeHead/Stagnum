import random
from typing import Callable

import pytest

from api.pool.randomization_algorithms import RandomizationParameters
from database.entities import User, PoolMember, PoolMemberRandomizationParameters


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
            users.append(User(spotify_id=faker.uuid4(), spotify_username=faker.name(),
                         spotify_avatar_url=f"example.picture.url{num}"))
        return users

    return wrapper


@pytest.fixture
def create_pool_from_users(faker) -> Callable[[tuple[tuple[User, int], ...]], list[PoolMember]]:
    def wrapper(*user_size_pairs: tuple[User, int]) -> list[PoolMember]:
        pool_id = random.randint(0, 999999)
        pool_members: list[PoolMember] = []
        rolling_id = 0
        for user, size in user_size_pairs:
            member_name = faker.text(max_nb_chars=25)[:-1]
            pool_member = (PoolMember(
                id=rolling_id,
                name=member_name,
                user_id=user.spotify_id,
                pool_id=pool_id,
                image_url=f"example.picture/{member_name}",
                content_uri=f"spotify:track:{faker.uuid4()}",
                duration_ms=random.randint(120000, 1200000),
                sort_order=rolling_id,
                parent_id=None
            ))
            pool_member.randomization_parameters = PoolMemberRandomizationParameters(
                weight=0,
                skips_since_last_play=0
            )
            rolling_id += 1
            pool_members.append(pool_member)
        return pool_members

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
    song_1_plays = 0
    song_2_plays = 0
    for _ in range(9999):
        pool = create_pool_from_users((users[0], 2))
        pool[0].randomization_parameters.weight = 1
        song = next_song_provider.select_next_song(pool, users)
        if song.id == pool[0].id:
            song_1_plays += 1
        else:
            song_2_plays += 1
    assert song_2_plays * (weighted_parameters.custom_weight_scale - 0.1) < song_1_plays


@pytest.mark.wip
@pytest.mark.slow
def should_balance_users_by_playtime(next_song_provider, create_test_users, create_pool_from_users,
                                     weighted_parameters, test_client, valid_token_header, db_connection):
    users = create_test_users(9)
    pool = create_pool_from_users(*[(user, 10) for user in users])
    for _ in range(20):
        test_client.post("/pool/playback/skip", headers=valid_token_header)
