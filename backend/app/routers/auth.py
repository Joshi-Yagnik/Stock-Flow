from app.database import database
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone, timedelta

from app.schemas.schemas import LoginRequest, TokenResponse, RefreshRequest, UserResponse, UserCreate, SendOtpRequest, VerifyOtpRequest
from app.database.database import get_db
from app.models.models import User, EmailVerification
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token, hash_password, generate_otp
from app.services.email_service import send_otp_email
from app.core.dependencies import get_current_active_user

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT tokens."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/register", response_model=UserResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    result = await db.execute(
        select(User).where(User.email == data.email)
    )
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    # Check if email is verified
    verify_result = await db.execute(
        select(EmailVerification).where(EmailVerification.email == data.email)
    )
    verification = verify_result.scalar_one_or_none()
    
    if not verification or not verification.is_verified:
        raise HTTPException(status_code=400, detail="Email is not verified. Please verify your email first.")
        
    hashed_password = hash_password(data.password)
    new_user = User(
        name=data.name,
        shop_name=data.shop_name,
        email=data.email,
        hashed_password=hashed_password,
        role=data.role
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/send-otp")
async def send_otp(data: SendOtpRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Send an OTP to the provided email."""
    # Check if email is already registered
    existing_user = await db.execute(select(User).where(User.email == data.email))
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    # Check for existing OTP record
    existing_verification = await db.execute(select(EmailVerification).where(EmailVerification.email == data.email))
    verification = existing_verification.scalar_one_or_none()
    
    # Generate new OTP
    otp = generate_otp()
    hashed_otp = hash_password(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    if verification:
        # Rate limit / Cool down check (e.g., must wait 30 seconds between requests)
        # Assuming frontend handles the 30s strictly, but backend can also enforce it if needed.
        # We will just overwrite with new OTP and reset attempts.
        verification.otp_hash = hashed_otp
        verification.expires_at = expires_at
        verification.attempts = 0
        verification.is_verified = False
    else:
        verification = EmailVerification(
            email=data.email,
            otp_hash=hashed_otp,
            expires_at=expires_at,
        )
        db.add(verification)
        
    await db.commit()
    
    # Send email in background
    background_tasks.add_task(send_otp_email, data.email, otp)
    
    return {"message": "OTP sent successfully."}

@router.post("/verify-otp")
async def verify_otp(data: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    """Verify the provided OTP."""
    result = await db.execute(select(EmailVerification).where(EmailVerification.email == data.email))
    verification = result.scalar_one_or_none()
    
    if not verification:
        raise HTTPException(status_code=400, detail="No OTP found for this email. Please request a new one.")
        
    if verification.is_verified:
        return {"message": "Email is already verified."}
        
    if verification.attempts >= 5:
        raise HTTPException(status_code=400, detail="Maximum verification attempts exceeded. Please request a new OTP.")
        
    if datetime.now(timezone.utc) > verification.expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please resend OTP.")
        
    verification.attempts += 1
    
    if not verify_password(data.otp, verification.otp_hash):
        await db.commit()
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please try again.")
        
    # Success
    verification.is_verified = True
    await db.commit()
    
    return {"message": "Email Verified Successfully"}

@router.post("/logout")
async def logout():
    """Invalidate user session."""
    # In a stateless JWT architecture, logout is primarily handled client-side
    # by deleting the tokens. A robust implementation might use a token blacklist.
    return {"message": "Successfully logged out"}

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a refresh token for new access token."""
    payload = decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Invalid token type")
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token(data={"sub": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user
