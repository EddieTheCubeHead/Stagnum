"""Added user table base

Revision ID: a2d83a505517
Revises: 
Create Date: 2024-01-27 16:20:12.164389

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2d83a505517'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'User',
        sa.Column('spotify_id', sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint('spotify_id')
    )


def downgrade() -> None:
    op.drop_table('User')
