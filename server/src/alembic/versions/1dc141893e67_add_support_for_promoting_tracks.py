"""Add support for promoting tracks

Revision ID: 1dc141893e67
Revises: 4fc5f9bc5558
Create Date: 2024-07-04 20:46:31.321412

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1dc141893e67"
down_revision: Union[str, None] = "4fc5f9bc5558"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("PoolJoinedUser", sa.Column("promoted_track_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "PoolJoinedUser_promoted_track_fkey",
        "PoolJoinedUser",
        "PoolMember",
        ["promoted_track_id"],
        ["id"],
        onupdate="CASCADE",
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("PoolJoinedUser_promoted_track_fkey", "PoolJoinedUser", type_="foreignkey")
    op.drop_column("PoolJoinedUser", "promoted_track_id")
