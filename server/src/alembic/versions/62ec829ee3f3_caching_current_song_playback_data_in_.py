"""Caching current song playback data in playback session

Revision ID: 62ec829ee3f3
Revises: 25c34e5bf930
Create Date: 2024-04-01 23:48:12.772757

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "62ec829ee3f3"
down_revision: Union[str, None] = "25c34e5bf930"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("PlaybackSession", sa.Column("current_track_uri", sa.String(length=128), nullable=True))
    op.add_column("PlaybackSession", sa.Column("current_track_name", sa.String(length=128), nullable=True))
    op.add_column("PlaybackSession", sa.Column("current_track_image_url", sa.String(length=256), nullable=True))
    op.add_column("PlaybackSession", sa.Column("current_track_duration_ms", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("PlaybackSession", "current_track_duration_ms")
    op.drop_column("PlaybackSession", "current_track_image_url")
    op.drop_column("PlaybackSession", "current_track_name")
    op.drop_column("PlaybackSession", "current_track_uri")
