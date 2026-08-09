from fastapi import APIRouter, Depends
from app.schemas.schemas import UserResponse
from app.models.models import User
from app.core.dependencies import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user
