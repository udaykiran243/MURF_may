"""
Admin API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..database import get_db
from .. import models

router = APIRouter(tags=["admin"])


@router.get("/stats")
async def get_admin_stats(db: AsyncSession = Depends(get_db)):
    """Get platform statistics for admin dashboard"""
    try:
        # Count users
        user_count = await db.execute(select(func.count(models.User.id)))
        users = user_count.scalar() or 0

        # Count conversations (if table exists)
        try:
            conv_count = await db.execute(select(func.count(models.Conversation.id)))
            conversations = conv_count.scalar() or 0
        except:
            conversations = 0

        # Count mood entries (if table exists)
        try:
            mood_count = await db.execute(select(func.count(models.MoodEntry.id)))
            moods = mood_count.scalar() or 0
        except:
            moods = 0

        return {
            "users": users,
            "conversations": conversations,
            "moods": moods,
            "status": "healthy"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics"
        )
