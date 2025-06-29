import datetime
import json
import random
from unittest.mock import Mock

import pytest
from _pytest.fixtures import FixtureRequest
from _pytest.monkeypatch import MonkeyPatch
from helpers.classes import CurrentPlaybackData, MockDateTimeWrapper
from starlette.testclient import TestClient
from test_types.aliases import MockResponseQueue
from test_types.callables import (
    AddTrackToPool,
    BuildSuccessResponse,
    CreateHeaderFromTokenResponse,
    CreateMemberPostData,
    CreateParentlessPoolMember,
    CreatePlayback,
    CreatePoolFromUsers,
    CreatePoolMembers,
    CreateRandomizationParameters,
    CreateRefreshTokenReturn,
    CreateTestUsers,
    CreateToken,
    CreateUsers,
    GetDbPlaybackData,
    GetQueryParameter,
    ImplementPoolFromMembers,
    IncrementNow,
    LogUserIn,
    MockPlaylistFetch,
    MockPoolMemberSpotifyFetch,
    MockTrackFetch,
    SharePoolAndGetCode,
    SkipSong,
    TimewarpToNextSong,
    ValidateModel,
)
from test_types.faker import FakerFixture
from test_types.typed_dictionaries import Headers, PoolContentData

from api.pool.models import PoolContent, PoolCreationData, UnsavedPoolTrack
from api.pool.randomization_algorithms import NextSongProvider, PoolRandomizer, RandomizationParameters
from database.entities import PoolJoinedUser, PoolMember, PoolMemberRandomizationParameters, User


@pytest.fixture(params=[RandomizationParameters(5, 5, 60, 90), RandomizationParameters(10, 3, 50, 75)])
def variable_weighted_parameters(request: FixtureRequest, monkeypatch: MonkeyPatch) -> RandomizationParameters:
    parameters: RandomizationParameters = request.param
    monkeypatch.setenv("CUSTOM_WEIGHT_SCALE", str(parameters.custom_weight_scale))
    monkeypatch.setenv("PSEUDO_RANDOM_FLOOR", str(parameters.pseudo_random_floor))
    monkeypatch.setenv("PSEUDO_RANDOM_CEILING", str(parameters.pseudo_random_ceiling))
    return parameters


@pytest.fixture
def create_test_users(faker: FakerFixture, logged_in_user: User) -> CreateTestUsers:
    def wrapper(amount: int) -> list[User]:
        users = [logged_in_user]
        for num in range(1, amount):
            user = User(
                spotify_id=faker.uuid4(), spotify_username=faker.name(), spotify_avatar_url=f"example.picture.url{num}"
            )
            users.append(user)
        return users

    return wrapper


@pytest.fixture
def create_pool_from_users(faker: FakerFixture) -> CreatePoolFromUsers:
    def wrapper(*user_size_pairs: (User, int)) -> dict[str, list[PoolMember]]:
        pool_id = random.randint(0, 999999)
        pool_members: dict[str, list[PoolMember]] = {}
        rolling_id = 0
        for index, user_size_pair in enumerate(user_size_pairs):
            user, _ = user_size_pair
            pool_members[user.spotify_id] = []
            member_name = faker.text(max_nb_chars=25)[:-1]
            pool_member = PoolMember(
                id=index,
                name=member_name,
                user_id=user.spotify_id,
                pool_id=pool_id,
                image_url=f"example.picture/{member_name}",
                content_uri=f"spotify:track:{faker.uuid4()}",
                duration_ms=random.randint(120000, 360000),
                sort_order=rolling_id,
                parent_id=None,
            )
            pool_member.randomization_parameters = PoolMemberRandomizationParameters(weight=0, skips_since_last_play=0)
            pool_members[user.spotify_id].append(pool_member)
        return pool_members

    return wrapper


@pytest.fixture
def mock_pool_member_spotify_fetch(
    requests_client_get_queue: MockResponseQueue, build_success_response: BuildSuccessResponse
) -> MockPoolMemberSpotifyFetch:
    def wrapper(pool_member: PoolMember) -> None:
        response = {
            "duration_ms": pool_member.duration_ms,
            "is_playable": True,
            "name": pool_member.name,
            "album": {
                "images": [{"url": f"https://pic.spotify.url/{pool_member.name}album", "height": 300, "width": 300}]
            },
            "preview_url": pool_member.image_url,
            "type": "track",
            "uri": pool_member.content_uri,
        }
        requests_client_get_queue.append(build_success_response(response))

    return wrapper


@pytest.fixture
def create_member_post_data() -> CreateMemberPostData:
    def wrapper(pool_member: PoolMember) -> PoolContentData:
        return PoolContent(spotify_uri=pool_member.content_uri).model_dump()

    return wrapper


@pytest.fixture
def add_track_to_pool(
    mock_pool_member_spotify_fetch: MockPoolMemberSpotifyFetch,
    create_member_post_data: CreateMemberPostData,
    test_client: TestClient,
) -> AddTrackToPool:
    def wrapper(track: PoolMember, headers: Headers) -> None:
        mock_pool_member_spotify_fetch(track)
        post_data = create_member_post_data(track)
        test_client.post("/pool/content", json=post_data, headers=headers)

    return wrapper


@pytest.fixture
def implement_pool_from_members(
    test_client: TestClient,
    create_token: CreateToken,
    log_user_in: LogUserIn,
    create_header_from_token_response: CreateHeaderFromTokenResponse,
    valid_token_header: Headers,
    create_member_post_data: CreateMemberPostData,
    add_track_to_pool: AddTrackToPool,
    share_pool_and_get_code: SharePoolAndGetCode,
    mock_pool_member_spotify_fetch: MockPoolMemberSpotifyFetch,
    current_playback_data: CurrentPlaybackData,
) -> ImplementPoolFromMembers:
    def wrapper(users: list[User], pool_members: dict[str, list[PoolMember]]) -> str:
        main_user = users[0]
        main_user_pool = pool_members[main_user.spotify_id]
        creation_data = PoolCreationData(spotify_uris=[create_member_post_data(main_user_pool[0])]).model_dump()
        mock_pool_member_spotify_fetch(main_user_pool[0])
        current_playback_data.current_track = {
            "name": main_user_pool[0].name,
            "uri": main_user_pool[0].content_uri,
            "duration_ms": main_user_pool[0].duration_ms,
        }
        test_client.post("/pool", json=creation_data, headers=valid_token_header)
        share_code = share_pool_and_get_code()
        for track in main_user_pool[1:]:
            add_track_to_pool(track, valid_token_header)
        for user in users[1:]:
            token = create_token()
            user.joined_pool = None
            log_user_in(user, token)
            header = create_header_from_token_response(token)
            test_client.post(f"/pool/join/{share_code}", headers=header)
            for track in pool_members[user.spotify_id]:
                add_track_to_pool(track, header)

        return share_code

    return wrapper


@pytest.fixture
def create_users(faker: FakerFixture) -> CreateUsers:
    def wrapper(user_amount: int) -> list[User]:
        return [
            User(
                spotify_id=faker.uuid4(),
                spotify_username=faker.user_name(),
                spotify_avatar_url=faker.url(),
                joined_pool=PoolJoinedUser(),
            )
            for _ in range(user_amount)
        ]

    return wrapper


@pytest.fixture
def create_parentless_pool_member(faker: FakerFixture) -> CreateParentlessPoolMember:
    def wrapper(user: User, sort_order: int = 0, pool_id: int | None = None) -> PoolMember:
        return PoolMember(
            user_id=user.spotify_id,
            name=" ".join(faker.words(3)),
            id=faker.random_int(),
            pool_id=pool_id,
            image_url=faker.url(),
            content_uri=f"spotify:track:{faker.uuid4()}",
            duration_ms=faker.random_int(120000, 600000),
            sort_order=sort_order,
            randomization_parameters=PoolMemberRandomizationParameters(weight=0, skips_since_last_play=0),
        )

    return wrapper


@pytest.fixture
def create_pool_members(faker: FakerFixture) -> CreatePoolMembers:
    def wrapper(
        users: list[User], *, tracks_per_user: int = 0, collections_per_user: int = 0, tracks_per_collection: int = 0
    ) -> list[PoolMember]:
        pool_members = []
        pool_id = faker.random_int()
        for user in users:
            pool_members += [
                PoolMember(
                    user_id=user.spotify_id,
                    id=faker.random_int(),
                    pool_id=pool_id,
                    image_url=faker.url(),
                    content_uri=f"spotify:track:{faker.uuid4()}",
                    duration_ms=faker.random_int(120000, 600000),
                    sort_order=sort,
                    randomization_parameters=PoolMemberRandomizationParameters(weight=0, skips_since_last_play=0),
                )
                for sort in range(tracks_per_user)
            ]

            for _ in range(collections_per_user):
                collection_id = faker.random_int()
                pool_members += [
                    PoolMember(
                        user_id=user.spotify_id,
                        id=faker.random_int(),
                        pool_id=pool_id,
                        image_url=faker.url(),
                        content_uri=f"spotify:track:{faker.uuid4()}",
                        duration_ms=faker.random_int(120000, 600000),
                        sort_order=sort,
                        parent_id=collection_id,
                        randomization_parameters=PoolMemberRandomizationParameters(weight=0, skips_since_last_play=0),
                    )
                    for sort in range(tracks_per_collection)
                ]

        return pool_members

    # This works perfectly fine. PyCharm has a bug that causes this to show a warning. Stack Overflow thread:
    # https://stackoverflow.com/questions/79111951/python-protocol-using-keyword-only-arguments-requires-implementation-to-have-dif
    # noinspection PyTypeChecker
    return wrapper


@pytest.fixture
def create_randomization_parameters() -> CreateRandomizationParameters:
    def wrapper(
        custom_weight_scale: int = 5,
        user_weight_scale: int = 20,
        pseudo_random_floor: int = 60,
        pseudo_random_ceiling: int = 90,
    ) -> RandomizationParameters:
        return RandomizationParameters(
            custom_weight_scale, user_weight_scale, pseudo_random_floor, pseudo_random_ceiling
        )

    return wrapper


@pytest.mark.slow
@pytest.mark.usefixtures("weighted_parameters")
def should_always_alternate_songs_in_two_song_queue(
    create_playback: CreatePlayback,
    valid_token_header: Headers,
    skip_song: SkipSong,
    requests_client: Mock,
    get_query_parameter: GetQueryParameter,
) -> None:
    create_playback(2)
    last_call_uri = None
    for _ in range(10):
        skip_song(valid_token_header)
        actual_queue_call = requests_client.post.call_args_list[-2]
        track_uri = get_query_parameter(actual_queue_call.args[0], "uri")
        assert last_call_uri != track_uri
        last_call_uri = track_uri


def should_always_play_song_that_was_not_played_last_in_two_song_queue(
    create_users: CreateUsers,
    create_pool_members: CreatePoolMembers,
    create_randomization_parameters: CreateRandomizationParameters,
) -> None:
    users = create_users(1)
    pool_members = create_pool_members(users, tracks_per_user=2)
    randomization_parameters = create_randomization_parameters()
    pool_members[0].randomization_parameters.skips_since_last_play = 1
    pool_members[1].randomization_parameters.skips_since_last_play = 2
    for _ in range(99):
        result = PoolRandomizer(pool_members, users, randomization_parameters, {users[0].spotify_id: 1}).get_next_song()
        assert result.content_uri == pool_members[1].content_uri


@pytest.mark.slow
def should_respect_custom_weight(
    next_song_provider: NextSongProvider,
    create_test_users: CreateTestUsers,
    create_pool_from_users: CreatePoolFromUsers,
    variable_weighted_parameters: RandomizationParameters,
) -> None:
    users = create_test_users(1)
    users[0].joined_pool = PoolJoinedUser()
    song_1_plays = 0
    song_2_plays = 0
    for _ in range(9999):
        pool = create_pool_from_users((users[0], 2))[users[0].spotify_id]
        pool[0].randomization_parameters.weight = 1
        song = next_song_provider.select_next_song(pool, users, {users[0].spotify_id: 1})
        if song.id == pool[0].id:
            song_1_plays += 1
        else:
            song_2_plays += 1
    assert song_2_plays * (variable_weighted_parameters.custom_weight_scale - 0.1) < song_1_plays


@pytest.mark.parametrize("_", range(10))
def should_balance_users_by_playtime(
    create_users: CreateUsers,
    create_pool_members: CreatePoolMembers,
    create_randomization_parameters: CreateRandomizationParameters,
    _: int,
) -> None:
    users = create_users(4)
    pool_members = create_pool_members(users, tracks_per_user=30, collections_per_user=2, tracks_per_collection=20)
    randomization_parameters = create_randomization_parameters()

    user_playtimes = {user.spotify_id: 0 for user in users}
    member_users = {member.content_uri: member.user_id for member in pool_members}
    for _ in range(999):
        result = PoolRandomizer(pool_members, users, randomization_parameters, user_playtimes).get_next_song()
        user_playtimes[member_users[result.content_uri]] += result.duration_ms

    pool_users_playtime = list(user_playtimes.values())
    pool_users_playtime.sort()
    minimum_playtime_share = 0.85
    assert pool_users_playtime[0] / pool_users_playtime[-1] > minimum_playtime_share


def should_ignore_users_with_no_songs_over_played_since_pseudo_random_floor(
    create_users: CreateUsers,
    create_pool_members: CreatePoolMembers,
    create_randomization_parameters: CreateRandomizationParameters,
) -> None:
    users = create_users(2)
    users[1].joined_pool.playback_time_ms = 100
    pool_members = create_pool_members([users[0]], tracks_per_user=30, collections_per_user=2, tracks_per_collection=20)
    pool_members.extend(create_pool_members([users[1]], tracks_per_user=1))
    pool_members[-1].randomization_parameters.skips_since_last_play = 1
    randomization_parameters = create_randomization_parameters()

    iterations = 9999
    for _ in range(iterations):
        result = PoolRandomizer(
            pool_members, users, randomization_parameters, {users[0].spotify_id: 1, users[1].spotify_id: 1}
        ).get_next_song()
        assert result.user_id == users[0].spotify_id


@pytest.mark.slow
@pytest.mark.asyncio
@pytest.mark.parametrize("_", range(10))
@pytest.mark.usefixtures("correct_env_variables")
async def should_not_consider_playback_time_over_history_threshold_for_user_weights(
    joined_user_header: Headers,
    mock_datetime_wrapper: MockDateTimeWrapper,
    timewarp_to_next_song: TimewarpToNextSong,
    monkeypatch: MonkeyPatch,
    create_refresh_token_return: CreateRefreshTokenReturn,
    increment_now: IncrementNow,
    requests_client_post_queue: MockResponseQueue,
    mock_playlist_fetch: MockPlaylistFetch,
    test_client: TestClient,
    get_db_playback_data: GetDbPlaybackData,
    logged_in_user_id: str,
    another_logged_in_user_id: str,
    _: int,
) -> None:
    monkeypatch.setenv("HISTORY_LENGTH_MINUTES", "60")
    start_time = mock_datetime_wrapper.now()
    queue_post_response = Mock()
    queue_post_response.status_code = 200
    queue_post_response.content = json.dumps({}).encode("utf-8")
    while mock_datetime_wrapper.now() - start_time < datetime.timedelta(minutes=55):
        requests_client_post_queue.append(queue_post_response)
        await timewarp_to_next_song()
    increment_now(datetime.timedelta(minutes=10))
    # The refresh flow sends post song before it sends get refreshed token
    requests_client_post_queue.append(queue_post_response)
    create_refresh_token_return(99999)
    while mock_datetime_wrapper.now() - start_time < datetime.timedelta(hours=2):
        requests_client_post_queue.append(queue_post_response)
        await timewarp_to_next_song()

    pool_content_data = mock_playlist_fetch(15)
    test_client.post("/pool/content", json=pool_content_data, headers=joined_user_header)
    song_counts = {logged_in_user_id: 0, another_logged_in_user_id: 0}

    while mock_datetime_wrapper.now() - start_time < datetime.timedelta(hours=3):
        requests_client_post_queue.append(queue_post_response)
        await timewarp_to_next_song()
        playback_session = get_db_playback_data()
        song_counts[playback_session.current_track.user_id] += 1

    song_ratio = song_counts[logged_in_user_id] / song_counts[another_logged_in_user_id]
    # Before decay implementation, the ratio used to be 0 or just above
    # Now in rare situations (seems to be about 1 in 25) it can spike over 1
    # TODO implement a pytest mark for "probabilistic" tests like so:
    # pytest.mark.probabilistic(repetitions=10, allowed_fails=1)  # noqa: ERA001 - example code
    min_required_ratio = 0.2
    max_allowed_ratio = 0.9
    assert min_required_ratio < song_ratio < max_allowed_ratio


@pytest.mark.slow
@pytest.mark.parametrize("_", range(10))
def should_de_weight_all_copies_of_a_track_if_multiple_users_have_played_track_in_pool(
    create_users: CreateUsers,
    implement_pool_from_members: ImplementPoolFromMembers,
    create_parentless_pool_member: CreateParentlessPoolMember,
    skip_song: SkipSong,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    another_logged_in_user_header: Headers,
    test_client: TestClient,
    mock_track_fetch: MockTrackFetch,
    _: int,
) -> None:
    users = create_users(5)
    common_member = create_parentless_pool_member(users[0])
    user_member_mappings = {user.spotify_id: [common_member] for user in users[:-1]}
    shared_pool_code = implement_pool_from_members(users[:-1], user_member_mappings)
    skip_song(valid_token_header)
    test_client.post(f"/pool/join/{shared_pool_code}", headers=another_logged_in_user_header)
    unique_member = mock_track_fetch()
    test_client.post("/pool/content", json=unique_member, headers=another_logged_in_user_header)
    skip_response = validate_model(UnsavedPoolTrack, skip_song(valid_token_header))
    assert skip_response.spotify_resource_uri == unique_member["spotify_uri"]


# If we set the weight for all to 0 and THEN skip, it might cause unexpected errors if all are counted for pool length
# this test just validates that skip works normally in that case
def should_count_tracks_duplicated_between_users_as_just_one_pool_member_for_length_based_weighting(
    create_users: CreateUsers,
    implement_pool_from_members: ImplementPoolFromMembers,
    create_parentless_pool_member: CreateParentlessPoolMember,
    skip_song: SkipSong,
    valid_token_header: Headers,
    validate_model: ValidateModel,
) -> None:
    users = create_users(10)
    common_member = create_parentless_pool_member(users[0])
    user_member_mappings = {user.spotify_id: [common_member] for user in users}
    implement_pool_from_members(users, user_member_mappings)
    skip_song(valid_token_header)
    skip_response = validate_model(UnsavedPoolTrack, skip_song(valid_token_header))
    assert skip_response.spotify_resource_uri == common_member.content_uri
