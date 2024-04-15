import pytest
from sqlalchemy import select

from database.entities import Pool, PoolMember, PoolJoinedUser, PlaybackSession


def should_wipe_whole_pool_on_delete_pool(existing_playback, test_client, validate_response, db_connection,
                                          valid_token_header):
    response = test_client.delete("/pool", headers=valid_token_header)

    validate_response(response, 204)

    with db_connection.session() as session:
        assert session.scalar(select(Pool)) is None
        assert session.scalar(select(PoolMember)) is None
        assert session.scalar(select(PoolJoinedUser)) is None
        assert session.scalar(select(PlaybackSession)) is None