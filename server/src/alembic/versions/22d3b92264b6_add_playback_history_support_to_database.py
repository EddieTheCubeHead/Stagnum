"""Add playback history support to database

Revision ID: 22d3b92264b6
Revises: 1dc141893e67
Create Date: 2025-06-21 22:31:46.005400

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "22d3b92264b6"
down_revision: str | None = "1dc141893e67"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "PlayedPoolMember",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("joined_user_id", sa.String(length=64), nullable=False),
        sa.Column("pool_member_id", sa.Integer(), nullable=False),
        sa.Column("played_time_ms", sa.Integer(), nullable=False),
        sa.Column("insert_time_stamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["joined_user_id"], ["PoolJoinedUser.user_id"]),
        sa.ForeignKeyConstraint(["pool_member_id"], ["PoolMember.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.drop_column("PoolJoinedUser", "playback_time_ms")


def downgrade() -> None:
    op.add_column("PoolJoinedUser", sa.Column("playback_time_ms", sa.INTEGER(), autoincrement=False))
    op.drop_table("PlayedPoolMember")
