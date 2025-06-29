"""Add data required for login and auth functionality

Revision ID: 149e2197ecff
Revises: af9978211950
Create Date: 2024-02-04 16:03:08.775667

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "149e2197ecff"
down_revision: str | None = "af9978211950"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "LoginState",
        sa.Column("state_string", sa.String(length=16), nullable=False),
        sa.Column("insert_time_stamp", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("state_string"),
    )
    op.add_column("User", sa.Column("insert_time_stamp", sa.DateTime(), nullable=False))


def downgrade() -> None:
    op.drop_column("User", "insert_time_stamp")
    op.drop_table("LoginState")
