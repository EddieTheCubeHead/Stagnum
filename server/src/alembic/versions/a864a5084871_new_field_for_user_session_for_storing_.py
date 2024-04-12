"""New field for user session for storing last login token

Revision ID: a864a5084871
Revises: 62ec829ee3f3
Create Date: 2024-04-11 18:01:39.893767

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a864a5084871'
down_revision: Union[str, None] = '62ec829ee3f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('UserSession', sa.Column('last_login_token', sa.String(length=512), nullable=True))


def downgrade() -> None:
    op.drop_column('UserSession', 'last_login_token')
