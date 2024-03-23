"""Extract pool member randomization parameters into a separate table

Revision ID: 40995fba9cba
Revises: 70e02357c5ff
Create Date: 2024-03-23 10:25:13.179105

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '40995fba9cba'
down_revision: Union[str, None] = '70e02357c5ff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('PoolMemberRandomizationParameters',
                    sa.Column('pool_member_id', sa.Integer(), nullable=False),
                    sa.Column('weight', sa.Float(), nullable=False),
                    sa.Column('skips_since_last_play', sa.Integer(), nullable=False),
                    sa.Column('insert_time_stamp', sa.DateTime(), nullable=False),
                    sa.ForeignKeyConstraint(['pool_member_id'], ['PoolMember.id'], onupdate='CASCADE',
                                            ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('pool_member_id')
                    )
    op.drop_column('PoolMember', 'weight')


def downgrade() -> None:
    op.add_column('PoolMember', sa.Column('weight', sa.INTEGER(), autoincrement=False, nullable=False))
    op.drop_table('PoolMemberRandomizationParameters')
