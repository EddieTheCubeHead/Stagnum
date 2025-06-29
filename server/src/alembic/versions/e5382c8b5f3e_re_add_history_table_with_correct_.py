"""Re-add history table with correct constraints

Revision ID: e5382c8b5f3e
Revises: d2a36ff0d00d
Create Date: 2025-06-29 20:31:09.486316

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e5382c8b5f3e"
down_revision: str | None = "d2a36ff0d00d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "PlayedPoolMember",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("joined_user_id", sa.String(length=64), nullable=True),
        sa.Column("pool_member_id", sa.Integer(), nullable=True),
        sa.Column("played_time_ms", sa.Integer(), nullable=False),
        sa.Column("insert_time_stamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["joined_user_id"],
            ["PoolJoinedUser.user_id"],
            name="fk_played_pool_member_pool_joined_user",
            onupdate="CASCADE",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["pool_member_id"],
            ["PoolMember.id"],
            name="fk_played_pool_member_pool_member",
            onupdate="CASCADE",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("PlayedPoolMember")
