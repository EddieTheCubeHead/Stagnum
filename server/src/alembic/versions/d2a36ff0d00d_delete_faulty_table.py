"""Delete faulty table

Revision ID: d2a36ff0d00d
Revises: 22d3b92264b6
Create Date: 2025-06-29 20:30:35.700233

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "d2a36ff0d00d"
down_revision: str | None = "22d3b92264b6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_table("PlayedPoolMember")


def downgrade() -> None:
    op.create_table(
        "PlayedPoolMember",
        sa.Column(
            "id",
            sa.INTEGER(),
            server_default=sa.text("nextval('\"PlayedPoolMember_id_seq\"'::regclass)"),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column("joined_user_id", sa.VARCHAR(length=64), autoincrement=False, nullable=False),
        sa.Column("pool_member_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column("played_time_ms", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column("insert_time_stamp", postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(
            ["joined_user_id"], ["PoolJoinedUser.user_id"], name="PlayedPoolMember_joined_user_id_fkey"
        ),
        sa.ForeignKeyConstraint(["pool_member_id"], ["PoolMember.id"], name="PlayedPoolMember_pool_member_id_fkey"),
        sa.PrimaryKeyConstraint("id", name="PlayedPoolMember_pkey"),
    )
