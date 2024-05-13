"""Double avatar url length

Revision ID: 4fc5f9bc5558
Revises: a864a5084871
Create Date: 2024-04-14 20:05:43.487023

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "4fc5f9bc5558"
down_revision: Union[str, None] = "a864a5084871"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "User",
        "spotify_avatar_url",
        existing_type=sa.VARCHAR(length=256),
        type_=sa.String(length=512),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "User",
        "spotify_avatar_url",
        existing_type=sa.String(length=512),
        type_=sa.VARCHAR(length=256),
        existing_nullable=True,
    )
