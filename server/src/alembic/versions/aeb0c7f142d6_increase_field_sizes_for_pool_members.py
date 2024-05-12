"""Increase field sizes for pool members

Revision ID: aeb0c7f142d6
Revises: 3b8805c4d7db
Create Date: 2024-03-17 13:25:12.253269

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "aeb0c7f142d6"
down_revision: Union[str, None] = "3b8805c4d7db"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "PoolMember", "name", existing_type=sa.VARCHAR(length=64), type_=sa.String(length=128), existing_nullable=False,
    )
    op.alter_column(
        "PoolMember",
        "image_url",
        existing_type=sa.VARCHAR(length=64),
        type_=sa.String(length=256),
        existing_nullable=False,
    )
    op.alter_column(
        "PoolMember",
        "content_uri",
        existing_type=sa.VARCHAR(length=64),
        type_=sa.String(length=128),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "PoolMember",
        "content_uri",
        existing_type=sa.String(length=128),
        type_=sa.VARCHAR(length=64),
        existing_nullable=False,
    )
    op.alter_column(
        "PoolMember",
        "image_url",
        existing_type=sa.String(length=256),
        type_=sa.VARCHAR(length=64),
        existing_nullable=False,
    )
    op.alter_column(
        "PoolMember", "name", existing_type=sa.String(length=128), type_=sa.VARCHAR(length=64), existing_nullable=False,
    )
