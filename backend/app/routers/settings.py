"""Settings router stubs."""
from fastapi import APIRouter, Depends
from app.schemas.schemas import AppSettingsUpdate, AppSettingsResponse
from app.core.dependencies import get_current_owner
from app.models.models import User

router = APIRouter()


@router.get("/", response_model=AppSettingsResponse)
async def get_settings(current_user: User = Depends(get_current_owner)):
    raise NotImplementedError


@router.patch("/", response_model=AppSettingsResponse)
async def update_settings(data: AppSettingsUpdate, current_user: User = Depends(get_current_owner)):
    raise NotImplementedError
