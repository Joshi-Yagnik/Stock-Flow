"""Users, Stock, Reports, and Settings router stubs."""
from fastapi import APIRouter, Depends
from app.schemas.schemas import (
    UserCreate,
    UserUpdate,
    UserResponse,
    StockTransactionCreate,
    StockTransactionResponse,
    DashboardStats,
    AppSettingsUpdate,
    AppSettingsResponse,
)
from app.core.dependencies import get_current_active_user
from app.models.models import User

# ─── Users ────────────────────────────────────────────────────────────────────
router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_current_user(data: UserUpdate, current_user: User = Depends(get_current_active_user)):
    raise NotImplementedError


@router.patch("/me/password")
async def change_password(current_password: str, new_password: str, current_user: User = Depends(get_current_active_user)):
    raise NotImplementedError
