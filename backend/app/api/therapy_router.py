"""
Therapy and wellness features API
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timedelta, timezone
from typing import List

from ..database import get_db
from .. import models, schemas
from ..utils.auth import get_current_user
from ..services.ai_service import EmotionalAIService

router = APIRouter(tags=["therapy"])
ai_service = EmotionalAIService()


@router.post("/conversations", response_model=schemas.ConversationResponse)
async def create_conversation(
    request: schemas.ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new therapy conversation"""
    try:
        conversation = models.Conversation(
            user_id=current_user.id,
            personality_mode=request.personality_mode,
            mood_at_start=request.mood_at_start,
            started_at=datetime.now(timezone.utc),
            session_duration=0,
            message_count=0
        )
        db.add(conversation)
        await db.flush()

        # Create initial AI memory
        ai_memory = models.AiMemory(
            conversation_id=conversation.id,
            memory_type="conversation_start",
            memory_content=f"User started conversation with mood: {request.mood_at_start}"
        )
        db.add(ai_memory)
        await db.commit()
        await db.refresh(conversation)

        return schemas.ConversationResponse(
            id=conversation.id,
            user_id=conversation.user_id,
            personality_mode=conversation.personality_mode,
            started_at=conversation.started_at,
            message_count=conversation.message_count,
            session_duration=conversation.session_duration
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}", response_model=schemas.ConversationResponse)
async def get_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get conversation details"""
    stmt = select(models.Conversation).where(
        (models.Conversation.id == conversation_id) &
        (models.Conversation.user_id == current_user.id)
    )
    conversation = await db.execute(stmt)
    conversation = conversation.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return schemas.ConversationResponse(
        id=conversation.id,
        user_id=conversation.user_id,
        personality_mode=conversation.personality_mode,
        started_at=conversation.started_at,
        ended_at=conversation.ended_at,
        message_count=conversation.message_count,
        session_duration=conversation.session_duration,
        summary=conversation.summary
    )


@router.post("/conversations/{conversation_id}/end")
async def end_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """End a therapy conversation"""
    try:
        stmt = select(models.Conversation).where(
            (models.Conversation.id == conversation_id) &
            (models.Conversation.user_id == current_user.id)
        )
        conversation = await db.execute(stmt)
        conversation = conversation.scalar_one_or_none()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        conversation.ended_at = datetime.now(timezone.utc)

        # Generate conversation summary
        stmt = select(models.Message).where(models.Message.conversation_id == conversation_id)
        messages = (await db.execute(stmt)).scalars().all()
        message_list = [{"content": m.content, "sender": m.sender_type} for m in messages]

        if message_list:
            summary = await ai_service.analyze_conversation_patterns(message_list)
            conversation.summary = str(summary)

        await db.commit()

        return {"message": "Conversation ended", "conversation_id": conversation_id}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mood", response_model=schemas.MoodEntryResponse)
async def log_mood(
    mood_data: schemas.MoodEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Log daily mood entry"""
    try:
        mood_entry = models.MoodEntry(
            user_id=current_user.id,
            mood=mood_data.mood,
            intensity=mood_data.intensity,
            notes=mood_data.notes,
            triggers=mood_data.triggers or [],
            activities=mood_data.activities or [],
            created_at=datetime.now(timezone.utc)
        )
        db.add(mood_entry)
        await db.commit()
        await db.refresh(mood_entry)

        return schemas.MoodEntryResponse(
            id=mood_entry.id,
            user_id=mood_entry.user_id,
            mood=mood_entry.mood,
            intensity=mood_entry.intensity,
            notes=mood_entry.notes,
            triggers=mood_entry.triggers,
            activities=mood_entry.activities,
            created_at=mood_entry.created_at
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mood/history")
async def get_mood_history(
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get mood history for last N days"""
    since = datetime.utcnow() - timedelta(days=days)
    
    stmt = select(models.MoodEntry).where(
        (models.MoodEntry.user_id == current_user.id) &
        (models.MoodEntry.created_at >= since)
    ).order_by(desc(models.MoodEntry.created_at))
    
    mood_entries = (await db.execute(stmt)).scalars().all()
    
    return {
        "entries": [
            {
                "mood": m.mood,
                "intensity": m.intensity,
                "date": m.created_at.isoformat()
            }
            for m in mood_entries
        ],
        "period": f"last {days} days"
    }


@router.post("/journal", response_model=schemas.JournalEntryResponse)
async def create_journal_entry(
    entry_data: schemas.JournalEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create journal entry with AI insights"""
    try:
        journal_entry = models.JournalEntry(
            user_id=current_user.id,
            title=entry_data.title,
            content=entry_data.content,
            mood=entry_data.mood,
            gratitude_items=entry_data.gratitude_items or [],
            is_private=entry_data.is_private,
            created_at=datetime.utcnow()
        )

        # Generate AI insights
        ai_insights = await ai_service.generate_empathetic_response(
            user_message=f"I wrote: {entry_data.content[:500]}",
            personality_mode="soft_therapist"
        )
        journal_entry.ai_generated_response = ai_insights

        db.add(journal_entry)
        await db.commit()
        await db.refresh(journal_entry)

        return schemas.JournalEntryResponse(
            id=journal_entry.id,
            user_id=journal_entry.user_id,
            title=journal_entry.title,
            content=journal_entry.content,
            mood=journal_entry.mood,
            gratitude_items=journal_entry.gratitude_items,
            ai_generated_response=journal_entry.ai_generated_response,
            created_at=journal_entry.created_at
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/therapy/session", response_model=schemas.TherapySessionResponse)
async def create_therapy_session(
    session_data: schemas.TherapySessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create therapy session (meditation, breathing, etc.)"""
    try:
        session = models.TherapySession(
            user_id=current_user.id,
            session_type=session_data.session_type,
            duration=session_data.duration,
            effectiveness_rating=session_data.effectiveness_rating,
            notes=session_data.notes,
            completed=session_data.effectiveness_rating is not None,
            created_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc) if session_data.effectiveness_rating else None
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

        return schemas.TherapySessionResponse(
            id=session.id,
            user_id=session.user_id,
            session_type=session.session_type,
            duration=session.duration,
            effectiveness_rating=session.effectiveness_rating,
            completed=session.completed,
            created_at=session.created_at,
            completed_at=session.completed_at
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/affirmation", response_model=schemas.AffirmationResponse)
async def get_affirmation(
    mood: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generate personalized affirmation"""
    try:
        affirmation_text = await ai_service.generate_affirmation(mood, intensity=5)

        affirmation = models.Affirmation(
            user_id=current_user.id,
            content=affirmation_text,
            category=mood,
            is_custom=True
        )
        db.add(affirmation)
        await db.commit()
        await db.refresh(affirmation)

        return schemas.AffirmationResponse(
            id=affirmation.id,
            user_id=affirmation.user_id,
            content=affirmation.content,
            category=affirmation.category,
            used_count=affirmation.used_count,
            is_custom=affirmation.is_custom,
            created_at=affirmation.created_at
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/emotion")
async def get_emotion_analytics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get emotion analytics and insights"""
    since = datetime.utcnow() - timedelta(days=days)

    stmt = select(models.MoodEntry).where(
        (models.MoodEntry.user_id == current_user.id) &
        (models.MoodEntry.created_at >= since)
    )
    mood_entries = (await db.execute(stmt)).scalars().all()

    mood_distribution = {}
    total_intensity = 0
    all_triggers = []

    for entry in mood_entries:
        mood_distribution[entry.mood] = mood_distribution.get(entry.mood, 0) + 1
        total_intensity += entry.intensity
        all_triggers.extend(entry.triggers)

    avg_intensity = total_intensity / len(mood_entries) if mood_entries else 0

    return {
        "period": f"{days} days",
        "mood_distribution": mood_distribution,
        "average_emotional_intensity": avg_intensity,
        "most_common_triggers": list(set(all_triggers))[:5],
        "total_entries": len(mood_entries)
    }
