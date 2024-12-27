"""Big changes for support for pool joining and future proofing data structures

Revision ID: 70e02357c5ff
Revises: 27048d682757
Create Date: 2024-03-22 22:58:29.691236

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "70e02357c5ff"
down_revision: Union[str, None] = "27048d682757"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "Pool",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=32), nullable=True),
        sa.Column("owner_user_id", sa.String(length=64), nullable=False),
        sa.Column("insert_time_stamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["owner_user_id"], ["User.spotify_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "UserSession",
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("user_token", sa.String(length=512), nullable=False),
        sa.Column("refresh_token", sa.String(length=512), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("insert_time_stamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["User.spotify_id"]),
        sa.PrimaryKeyConstraint("user_id"),
    )
    op.create_table(
        "PoolJoinedUser",
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("pool_id", sa.Integer(), nullable=False),
        sa.Column("insert_time_stamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["pool_id"], ["Pool.id"], onupdate="CASCADE", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["User.spotify_id"]),
        sa.PrimaryKeyConstraint("user_id"),
    )
    op.create_table(
        "PoolShareData",
        sa.Column("pool_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=8), nullable=False),
        sa.Column("insert_time_stamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["pool_id"], ["Pool.id"], onupdate="CASCADE", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("pool_id"),
    )
    op.add_column("PoolMember", sa.Column("pool_id", sa.Integer(), nullable=False))
    op.create_foreign_key(
        "PoolMember_pool_id_fkey", "PoolMember", "Pool", ["pool_id"], ["id"], onupdate="CASCADE", ondelete="CASCADE"
    )


def downgrade() -> None:
    op.drop_constraint("PoolMember_pool_id_fkey", "PoolMember", type_="foreignkey")
    op.drop_column("PoolMember", "pool_id")
    op.drop_table("PoolShareData")
    op.drop_table("PoolJoinedUser")
    op.drop_table("UserSession")
    op.drop_table("Pool")
