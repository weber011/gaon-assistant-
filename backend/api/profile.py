from fastapi import APIRouter
from pydantic import BaseModel
from services.profile_service import get_farmer_profile, update_farmer_profile

router = APIRouter()

class ProfileUpdate(BaseModel):
    name: str = None
    village: str = None
    main_crop: str = None
    land_area: str = None
    preferred_mandi: str = None

@router.get("/profile")
async def get_profile(user_id: str = "default"):
    profile = get_farmer_profile(user_id)
    return profile

@router.post("/profile")
async def update_profile(updates: ProfileUpdate, user_id: str = "default"):
    updated = update_farmer_profile(user_id, updates.dict(exclude_unset=True))
    return updated
