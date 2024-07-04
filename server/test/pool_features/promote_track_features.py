import datetime

import pytest
from api.pool.models import PoolFullContents, PoolTrack, UnsavedPoolTrack
from starlette.testclient import TestClient
from test_types.callables import CreatePlayback, IncrementNow, RunSchedulingJob, SkipSong, ValidateModel
from test_types.typed_dictionaries import Headers


@pytest.fixture
def promoted_track(
    create_playback: CreatePlayback, validate_model: ValidateModel, test_client: TestClient, valid_token_header: Headers
) -> PoolTrack:
    create_playback(99)
    playing_pool = validate_model(PoolFullContents, test_client.get("/pool", headers=valid_token_header))
    return playing_pool.users[0].tracks[0]


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


@pytest.mark.slow
@pytest.mark.asyncio
@pytest.mark.parametrize("_", range(5))
async def should_play_promoted_track_the_next_time_users_track_is_played_queue_job(
    test_client: TestClient,
    valid_token_header: Headers,
    validate_model: ValidateModel,
    promoted_track: PoolTrack,
    run_scheduling_job: RunSchedulingJob,
    increment_now: IncrementNow,
    fixed_track_length_ms: int,
    _: int,
) -> None:
    test_client.post(f"/pool/promote/{promoted_track.id}", headers=valid_token_header)
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))

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
    fixed_track_length_ms: int,
) -> None:
    test_client.post(f"/pool/promote/{promoted_track.id}", headers=valid_token_header)
    increment_now(datetime.timedelta(milliseconds=(fixed_track_length_ms - 1000)))

    await run_scheduling_job()

    resulting_pool = validate_model(PoolFullContents, test_client.get("/pool", headers=valid_token_header))
    assert resulting_pool.users[0].user.promoted_track_id is None
