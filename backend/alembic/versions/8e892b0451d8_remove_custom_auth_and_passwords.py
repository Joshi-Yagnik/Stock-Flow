"""remove custom auth and passwords

Revision ID: 8e892b0451d8
Revises: 4e24bd9361e2
Create Date: 2026-08-08 17:38:08.461418

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e892b0451d8'
down_revision: Union[str, None] = '4e24bd9361e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop hashed_password column from users table
    op.drop_column('users', 'hashed_password')
    
    # Drop mobile_verifications table
    op.drop_index('ix_mobile_verifications_mobile_number', table_name='mobile_verifications')
    op.drop_table('mobile_verifications')


def downgrade() -> None:
    # Re-add hashed_password column to users table
    op.add_column('users', sa.Column('hashed_password', sa.VARCHAR(length=255), autoincrement=False, nullable=True))
    
    # Recreate mobile_verifications table
    op.create_table('mobile_verifications',
        sa.Column('id', sa.VARCHAR(length=36), autoincrement=False, nullable=False),
        sa.Column('mobile_number', sa.VARCHAR(length=15), autoincrement=False, nullable=False),
        sa.Column('otp_hash', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), autoincrement=False, nullable=False),
        sa.Column('attempts', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('is_verified', sa.BOOLEAN(), autoincrement=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), autoincrement=False, nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), autoincrement=False, nullable=False),
        sa.PrimaryKeyConstraint('id', name='mobile_verifications_pkey')
    )
    op.create_index('ix_mobile_verifications_mobile_number', 'mobile_verifications', ['mobile_number'], unique=False)
