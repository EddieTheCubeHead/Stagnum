"""Change spotify email to id in model

Revision ID: 2906819be645
Revises: 149e2197ecff
Create Date: 2024-02-04 17:39:39.477314

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2906819be645'
down_revision: Union[str, None] = '149e2197ecff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('User', sa.Column('spotify_id', sa.String(length=64), nullable=False))
    op.drop_column('User', 'spotify_email')
    op.create_primary_key('pk_User', 'User', ['spotify_id'])


def downgrade() -> None:
    op.add_column('User', sa.Column('spotify_email', sa.VARCHAR(length=128), autoincrement=False, nullable=False))
    op.drop_column('User', 'spotify_id')
    op.create_primary_key('pk_User', 'User', ['spotify_email'])
