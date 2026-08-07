from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import get_current_user_id
from app.database.database import get_db
from app.models.models import User

async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Fetch the current user from the database based on JWT subject."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure the current user is active."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_owner(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Ensure the current user has the 'owner' role."""
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Owner access required."
        )
    return current_user
