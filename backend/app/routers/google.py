from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
from datetime import datetime, timezone, timedelta
import os

from app.database.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.models import User, GoogleConnection
from app.schemas.schemas import GoogleConnectRequest, GoogleContactsListResponse, GoogleContactResponse

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = "http://localhost:5173"  # Standard redirect for @react-oauth/google in dev

def get_current_utc():
    return datetime.now(timezone.utc)

@router.post("/connect")
async def connect_google(
    request: GoogleConnectRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on the server.")

    # Exchange the code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": request.code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }
        )

    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to connect to Google.")

    token_data = token_response.json()
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3599)

    expires_at = get_current_utc() + timedelta(seconds=expires_in)

    # Check if a connection already exists
    result = await db.execute(select(GoogleConnection).where(GoogleConnection.user_id == current_user.id))
    connection = result.scalar_one_or_none()

    if connection:
        connection.access_token = access_token
        if refresh_token:
            connection.refresh_token = refresh_token
        connection.expires_at = expires_at
    else:
        connection = GoogleConnection(
            user_id=current_user.id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at
        )
        db.add(connection)

    await db.commit()
    return {"message": "Google Contacts connected successfully"}

@router.get("/contacts", response_model=GoogleContactsListResponse)
async def get_google_contacts(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(GoogleConnection).where(GoogleConnection.user_id == current_user.id))
    connection = result.scalar_one_or_none()

    if not connection:
        raise HTTPException(status_code=404, detail="Google Contacts not connected.")

    # Check if token needs refresh
    if connection.expires_at <= get_current_utc() + timedelta(minutes=5):
        if not connection.refresh_token:
            # Need reauth
            raise HTTPException(status_code=401, detail="GOOGLE_REAUTH_REQUIRED")
        
        # Refresh token
        async with httpx.AsyncClient() as client:
            refresh_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "refresh_token": connection.refresh_token,
                    "grant_type": "refresh_token"
                }
            )
            
        if refresh_response.status_code != 200:
            raise HTTPException(status_code=401, detail="GOOGLE_REAUTH_REQUIRED")
            
        token_data = refresh_response.json()
        connection.access_token = token_data.get("access_token")
        connection.expires_at = get_current_utc() + timedelta(seconds=token_data.get("expires_in", 3599))
        await db.commit()

    # Call Google People API
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://people.googleapis.com/v1/people/me/connections",
            params={
                "personFields": "names,emailAddresses,phoneNumbers,photos",
                "pageSize": 1000
            },
            headers={
                "Authorization": f"Bearer {connection.access_token}"
            }
        )

    if response.status_code != 200:
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="GOOGLE_REAUTH_REQUIRED")
        raise HTTPException(status_code=500, detail="Failed to fetch Google Contacts.")

    data = response.json()
    connections = data.get("connections", [])
    
    formatted_contacts = []
    for conn in connections:
        name = conn.get("names", [{}])[0].get("displayName")
        if not name:
            continue
            
        phone = None
        phones = conn.get("phoneNumbers", [])
        if phones:
            phone = phones[0].get("value")
            
        email = None
        emails = conn.get("emailAddresses", [])
        if emails:
            email = emails[0].get("value")
            
        photo = None
        photos = conn.get("photos", [])
        if photos:
            photo = photos[0].get("url")
            
        formatted_contacts.append(GoogleContactResponse(
            name=name,
            phone=phone,
            email=email,
            photo=photo
        ))

    return GoogleContactsListResponse(contacts=formatted_contacts)

@router.delete("/disconnect")
async def disconnect_google(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(GoogleConnection).where(GoogleConnection.user_id == current_user.id))
    connection = result.scalar_one_or_none()

    if connection:
        await db.delete(connection)
        await db.commit()

    return {"message": "Disconnected successfully"}
