"""Make user icon url nullable

Revision ID: 27048d682757
Revises: aeb0c7f142d6
Create Date: 2024-03-17 21:41:39.600945

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '27048d682757'
down_revision: Union[str, None] = 'aeb0c7f142d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('User', 'spotify_avatar_url',
                    existing_type=sa.VARCHAR(length=256),
                    nullable=True)


def downgrade() -> None:
    op.alter_column('User', 'spotify_avatar_url',
                    existing_type=sa.VARCHAR(length=256),
                    nullable=False)
