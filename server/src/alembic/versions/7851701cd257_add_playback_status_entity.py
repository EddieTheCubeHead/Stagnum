"""Add playback status entity

Revision ID: 7851701cd257
Revises: 6b917dddd71e
Create Date: 2024-03-03 10:41:34.028762

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7851701cd257'
down_revision: Union[str, None] = '6b917dddd71e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('PlaybackSession',
        sa.Column('user_id', sa.String(length=64), nullable=False),
        sa.Column('current_track_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('next_song_change_timestamp', sa.DateTime(), nullable=False),
        sa.Column('insert_time_stamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['current_track_id'], ['PoolMember.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['User.spotify_id'], ),
        sa.PrimaryKeyConstraint('user_id')
    )
    op.add_column('PoolMember', sa.Column('duration_ms', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('PoolMember', 'duration_ms')
    op.drop_table('PlaybackSession')
