import datetime
import random

import pytest
from api.pool.models import PoolFullContents, PoolTrack, UnsavedPoolTrack
from helpers.classes import CurrentPlaybackData, MockedPoolContents
from starlette.testclient import TestClient
from test_types.callables import CreatePool, IncrementNow, MockTrackFetch, RunSchedulingJob, SkipSong, ValidateModel
from test_types.typed_dictionaries import Headers


@pytest.fixture
def promotable_collection_child(
    create_pool: CreatePool,
    validate_model: ValidateModel,
    current_playback_data: CurrentPlaybackData,
    mocked_pool_contents: MockedPoolContents,
) -> PoolTrack:
    playing_pool = validate_model(PoolFullContents, create_pool(albums=[12, 15, 16, 17, 11, 10]))
    for album in mocked_pool_contents.albums:
        for track in album["tracks"]["items"]:
            if track["uri"] == playing_pool.currently_playing.spotify_resource_uri:
                current_playback_data.current_track = track
                break
        else:
            continue
        break
    current_playback_data.current_track = mocked_pool_contents.albums[0]["tracks"]["items"][0]
    return playing_pool.users[0].collections[3].tracks[6]


@pytest.fixture
def song_promoted_by_another_user(
    joined_user_header: Headers,
    mock_track_fetch: MockTrackFetch,
    test_client: TestClient,
    validate_model: ValidateModel,
) -> None:
    pool_content_data = mock_track_fetch()
    response = test_client.post("/pool/content", json=pool_content_data, headers=joined_user_header)
    added_track = validate_model(PoolFullContents, response)
    promotion_response = test_client.post(
        f"/pool/promote/{added_track.users[1].tracks[0].id}", headers=joined_user_header
    )
    return validate_model(PoolFullContents, promotion_response).users[1].user.promoted_track_id


@pytest.mark.usefixtures("existing_playback")
def should_be_able_to_promote_track(
    test_client: TestClient, valid_token_header: Headers, validate_model: ValidateModel, promoted_track: PoolTrack
) -> None:
    promoted_pool_response = test_client.post(f"/pool/promote/{promoted_track.id}", headers=valid_token_header)
    promoted_pool_model = validate_model(PoolFullContents, promoted_pool_response)

    assert promoted_pool_model.users[0].user.promoted_track_id == promoted_track.id


@pytest.mark.slow
@pytest.mark.parametrize("_", range(5))
def should_play_promoted_track_the_next_time_users_track_is_played_by_skip(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    skip_song: SkipSong,
    promoted_track: PoolTrack,
    _: int,
) -> None:
    test_client.post(f"/pool/promote/{promoted_track.id}", headers=valid_token_header)

    next_song_response = skip_song(valid_token_header)
    next_song = validate_model(UnsavedPoolTrack, next_song_response)
    assert next_song.spotify_resource_uri == promoted_track.spotify_resource_uri


def should_set_promoted_track_to_none_after_track_is_selected_by_skip(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    promoted_track: PoolTrack,
    skip_song: SkipSong,
) -> None:
    test_client.post(f"/pool/promote/{promoted_track.id}", headers=valid_token_header)

    skip_song(valid_token_header)

    resulting_pool = validate_model(PoolFullContents, test_client.get("/pool", headers=valid_token_header))
    assert resulting_pool.users[0].user.promoted_track_id is None


@pytest.mark.asyncio
@pytest.mark.parametrize("_", range(5))
async def should_play_promoted_track_the_next_time_users_track_is_played_queue_job(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    promoted_track: PoolTrack,
    run_scheduling_job: RunSchedulingJob,
    increment_now: IncrementNow,
    current_playback_data: CurrentPlaybackData,
    _: int,
) -> None:
    test_client.post(f"/pool/promote/{promoted_track.id}", headers=valid_token_header)
    increment_now(datetime.timedelta(milliseconds=(current_playback_data.current_track["duration_ms"] - 1500)))

    await run_scheduling_job()

    resulting_pool = validate_model(PoolFullContents, test_client.get("/pool", headers=valid_token_header))
    assert resulting_pool.currently_playing.spotify_resource_uri == promoted_track.spotify_resource_uri


@pytest.mark.asyncio
async def should_set_promoted_track_to_none_after_track_is_selected_by_queue_job(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    promoted_track: PoolTrack,
    run_scheduling_job: RunSchedulingJob,
    increment_now: IncrementNow,
    current_playback_data: CurrentPlaybackData,
) -> None:
    test_client.post(f"/pool/promote/{promoted_track.id}", headers=valid_token_header)
    increment_now(datetime.timedelta(milliseconds=(current_playback_data.current_track["duration_ms"] - 1500)))

    await run_scheduling_job()

    resulting_pool = validate_model(PoolFullContents, test_client.get("/pool", headers=valid_token_header))
    assert resulting_pool.users[0].user.promoted_track_id is None


@pytest.mark.usefixtures("song_promoted_by_another_user")
@pytest.mark.asyncio
async def should_set_non_owner_promoted_to_none_after_track_is_selected_by_queue_job(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    run_scheduling_job: RunSchedulingJob,
    increment_now: IncrementNow,
    current_playback_data: CurrentPlaybackData,
) -> None:
    random.seed(10)  # prevent test flaking to randomization - 1 in 400 if we don't seed this
    increment_now(datetime.timedelta(milliseconds=(current_playback_data.current_track["duration_ms"] - 1500)))

    await run_scheduling_job()

    resulting_pool = validate_model(PoolFullContents, test_client.get("/pool", headers=valid_token_header))
    assert resulting_pool.users[0].user.promoted_track_id is None
    assert resulting_pool.users[1].user.promoted_track_id is None


def should_reset_promotion_data_if_promoted_track_is_deleted(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    promoted_track: PoolTrack,
    skip_song: SkipSong,
) -> None:
    test_client.post(f"/pool/promote/{promoted_track.id}", headers=valid_token_header)
    test_client.delete(f"/pool/content/{promoted_track.id}", headers=valid_token_header)

    skip_response = skip_song(valid_token_header)

    validate_model(UnsavedPoolTrack, skip_response)


def should_reset_promotion_data_if_promoted_track_parent_is_deleted(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    promotable_collection_child: PoolTrack,
    skip_song: SkipSong,
) -> None:
    test_client.post(f"/pool/promote/{promotable_collection_child.id}", headers=valid_token_header)
    test_client.delete(f"/pool/content/{promotable_collection_child.id}", headers=valid_token_header)

    skip_response = skip_song(valid_token_header)

    validate_model(UnsavedPoolTrack, skip_response)


@pytest.mark.wip
def should_reset_promotion_data_when_demote_track_is_called(
    test_client: TestClient, valid_token_header: Headers, validate_model: ValidateModel, promoted_track: PoolTrack
) -> None:
    test_client.post(f"/pool/promote/{promoted_track.id}", headers=valid_token_header)

    demoted_pool_response = test_client.post("/pool/demote", headers=valid_token_header)
    demoted_pool_model = validate_model(PoolFullContents, demoted_pool_response)
    assert demoted_pool_model.users[0].user.promoted_track_id is None
