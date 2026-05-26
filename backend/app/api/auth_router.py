"""
Authentication API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
import os
import jwt
from passlib.context import CryptContext

from ..database import get_db
from .. import models, schemas


router = APIRouter(tags=["auth"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


def hash_password(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """Create JWT token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


@router.post("/register", response_model=schemas.UserResponse)
async def register(
    user_data: schemas.UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """Register new user"""
    try:
        # Check if user exists
        stmt = select(models.User).where(models.User.email == user_data.email)
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user
        new_user = models.User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hash_password(user_data.password),
            is_active=True,
            preferred_personality="calm_mentor",
            dark_mode=True
        )

        db.add(new_user)
        await db.flush()
        await db.commit()
        await db.refresh(new_user)

        return schemas.UserResponse(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            is_active=new_user.is_active,
            language_preference=new_user.language_preference,
            preferred_personality=new_user.preferred_personality,
            dark_mode=new_user.dark_mode,
            created_at=new_user.created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=schemas.TokenResponse)
async def login(
    credentials: schemas.UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login user"""
    try:
        # Find user
        stmt = select(models.User).where(models.User.email == credentials.email)
        user = await db.execute(stmt)
        user = user.scalar_one_or_none()

        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Create tokens
        access_token = create_access_token({"sub": str(user.id)})

        return schemas.TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/logout")
async def logout():
    """Logout user"""
    return {"message": "Logged out successfully"}


@router.post("/admin-login", response_model=schemas.TokenResponse)
async def admin_login(
    credentials: schemas.UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Admin login endpoint"""
    try:
        # Demo admin credentials
        ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@serenemin.ai")
        ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123456")
        
        if credentials.email != ADMIN_EMAIL or credentials.password != ADMIN_PASSWORD:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin credentials"
            )

        # Create admin token
        access_token = create_access_token({
            "sub": "admin",
            "role": "admin"
        })

        return schemas.TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin login failed"
        )


@router.post("/test-user", response_model=schemas.TokenResponse)
async def create_test_user(
    db: AsyncSession = Depends(get_db)
):
    """
    Create a test user for development/testing
    Returns access token immediately
    """
    try:
        # Check if test user exists
        test_email = "test@serenemin.ai"
        stmt = select(models.User).where(models.User.email == test_email)
        result = await db.execute(stmt)
        test_user = result.scalar_one_or_none()

        # Create test user if doesn't exist
        if not test_user:
            test_user = models.User(
                email=test_email,
                full_name="Test User",
                hashed_password=hash_password("test123456"),
                is_active=True,
                preferred_personality="calm_mentor",
                dark_mode=True
            )
            db.add(test_user)
            await db.flush()
            await db.commit()
            await db.refresh(test_user)

        # Create token
        access_token = create_access_token({"sub": str(test_user.id)})

        return schemas.TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create test user: {str(e)}"
        )
