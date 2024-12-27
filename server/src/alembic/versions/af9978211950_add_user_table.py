"""Add user table

Revision ID: af9978211950
Revises:
Create Date: 2024-01-28 16:36:29.976955

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "af9978211950"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "User",
        sa.Column("spotify_id", sa.String(length=64), nullable=False),
        sa.Column("spotify_username", sa.String(length=64), nullable=False),
        sa.Column("spotify_avatar_url", sa.String(length=256), nullable=False),
        sa.PrimaryKeyConstraint("spotify_id"),
    )


def downgrade() -> None:
    op.drop_table("User")
