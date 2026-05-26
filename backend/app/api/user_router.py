"""
User management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from ..database import get_db
from .. import models, schemas
from ..utils.auth import get_current_user

router = APIRouter(tags=["users"])


@router.get("/profile", response_model=schemas.UserResponse)
async def get_profile(
    current_user: models.User = Depends(get_current_user)
):
    """Get current user profile"""
    return schemas.UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        language_preference=current_user.language_preference,
        preferred_personality=current_user.preferred_personality,
        dark_mode=current_user.dark_mode,
        created_at=current_user.created_at
    )


@router.put("/profile")
async def update_profile(
    update_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update user profile"""
    try:
        # Update allowed fields
        allowed_fields = [
            "full_name",
            "language_preference",
            "preferred_personality",
            "dark_mode"
        ]

        for field, value in update_data.items():
            if field in allowed_fields:
                setattr(current_user, field, value)

        current_user.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(current_user)

        return schemas.UserResponse(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.full_name,
            is_active=current_user.is_active,
            language_preference=current_user.language_preference,
            preferred_personality=current_user.preferred_personality,
            dark_mode=current_user.dark_mode,
            created_at=current_user.created_at
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/emotional-profile", response_model=schemas.EmotionalProfileResponse)
async def get_emotional_profile(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get user's emotional profile"""
    stmt = select(models.EmotionalProfile).where(
        models.EmotionalProfile.user_id == current_user.id
    )
    profile = await db.execute(stmt)
    profile = profile.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Emotional profile not found")

    return schemas.EmotionalProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        primary_concern=profile.primary_concern,
        emotional_patterns=profile.emotional_patterns,
        favorite_calming_methods=profile.favorite_calming_methods,
        recurring_stress_topics=profile.recurring_stress_topics,
        empathy_score=profile.empathy_score,
        resilience_score=profile.resilience_score,
        emotional_stability=profile.emotional_stability
    )


@router.put("/emotional-profile")
async def update_emotional_profile(
    update_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update emotional profile"""
    try:
        stmt = select(models.EmotionalProfile).where(
            models.EmotionalProfile.user_id == current_user.id
        )
        profile = await db.execute(stmt)
        profile = profile.scalar_one_or_none()

        if not profile:
            raise HTTPException(status_code=404, detail="Emotional profile not found")

        # Update allowed fields
        allowed_fields = [
            "primary_concern",
            "emotional_patterns",
            "favorite_calming_methods",
            "recurring_stress_topics",
            "empathy_score",
            "resilience_score",
            "emotional_stability"
        ]

        for field, value in update_data.items():
            if field in allowed_fields:
                setattr(profile, field, value)

        profile.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(profile)

        return schemas.EmotionalProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            primary_concern=profile.primary_concern,
            emotional_patterns=profile.emotional_patterns,
            favorite_calming_methods=profile.favorite_calming_methods,
            recurring_stress_topics=profile.recurring_stress_topics,
            empathy_score=profile.empathy_score,
            resilience_score=profile.resilience_score,
            emotional_stability=profile.emotional_stability
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/users/streak")
async def get_user_streak(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get user's conversation streak"""
    stmt = select(models.Conversation).where(
        models.Conversation.user_id == current_user.id
    )
    conversations = (await db.execute(stmt)).scalars().all()

    # Calculate streak (simplified)
    current_streak = len([c for c in conversations if c.ended_at is None or
                         (datetime.now(timezone.utc) - c.ended_at).days <= 1])
    longest_streak = len(conversations)

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_sessions": len(conversations),
        "avg_daily_sessions": len(conversations) / 30 if conversations else 0
    }


@router.get("/api/users/stats")
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get comprehensive user statistics"""
    # Get conversations
    stmt_conv = select(models.Conversation).where(
        models.Conversation.user_id == current_user.id
    )
    conversations = (await db.execute(stmt_conv)).scalars().all()

    # Get mood entries
    stmt_mood = select(models.MoodEntry).where(
        models.MoodEntry.user_id == current_user.id
    )
    mood_entries = (await db.execute(stmt_mood)).scalars().all()

    # Get journal entries
    stmt_journal = select(models.JournalEntry).where(
        models.JournalEntry.user_id == current_user.id
    )
    journal_entries = (await db.execute(stmt_journal)).scalars().all()

    # Get therapy sessions
    stmt_therapy = select(models.TherapySession).where(
        models.TherapySession.user_id == current_user.id
    )
    therapy_sessions = (await db.execute(stmt_therapy)).scalars().all()

    total_messages = sum(c.message_count for c in conversations)
    total_session_time = sum(c.session_duration for c in conversations)

    return {
        "total_conversations": len(conversations),
        "total_mood_entries": len(mood_entries),
        "total_journal_entries": len(journal_entries),
        "total_therapy_sessions": len(therapy_sessions),
        "total_messages": total_messages,
        "total_session_time": total_session_time,  # in seconds
        "average_session_duration": total_session_time / len(conversations) if conversations else 0
    }


@router.delete("/account")
async def delete_account(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete user account and all data"""
    try:
        await db.delete(current_user)
        await db.commit()

        return {"message": "Account deleted successfully"}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
