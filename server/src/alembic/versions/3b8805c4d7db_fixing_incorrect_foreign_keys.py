"""Fixing incorrect foreign keys

Revision ID: 3b8805c4d7db
Revises: 7851701cd257
Create Date: 2024-03-05 15:18:51.744044

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3b8805c4d7db"
down_revision: str | None = "7851701cd257"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("PlaybackSession", "current_track_id", existing_type=sa.INTEGER(), nullable=True)
    op.drop_constraint("PlaybackSession_current_track_id_fkey", "PlaybackSession", type_="foreignkey")
    op.create_foreign_key(
        "PlaybackSession_current_track_id_fkey",
        "PlaybackSession",
        "PoolMember",
        ["current_track_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.drop_constraint("PoolMember_parent_id_fkey", "PoolMember", type_="foreignkey")
    op.create_foreign_key(
        "PoolMember_parent_id_fkey",
        "PoolMember",
        "PoolMember",
        ["parent_id"],
        ["id"],
        onupdate="CASCADE",
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("PoolMember_parent_id_fkey", "PoolMember", type_="foreignkey")
    op.create_foreign_key("PoolMember_parent_id_fkey", "PoolMember", "PoolMember", ["parent_id"], ["id"])
    op.drop_constraint("PlaybackSession_current_track_id_fkey", "PlaybackSession", type_="foreignkey")
    op.create_foreign_key(
        "PlaybackSession_current_track_id_fkey", "PlaybackSession", "PoolMember", ["current_track_id"], ["id"]
    )
    op.alter_column("PlaybackSession", "current_track_id", existing_type=sa.INTEGER(), nullable=False)
