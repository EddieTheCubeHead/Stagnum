"""Add model for pool members

Revision ID: 6b917dddd71e
Revises: 149e2197ecff
Create Date: 2024-02-17 19:31:08.955617

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6b917dddd71e"
down_revision: Union[str, None] = "149e2197ecff"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "PoolMember",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("image_url", sa.String(length=64), nullable=False),
        sa.Column("content_uri", sa.String(length=64), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=True),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("weight", sa.Integer(), nullable=False),
        sa.Column("insert_time_stamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["parent_id"], ["PoolMember.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["User.spotify_id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("PoolMember")
