"""
Voice conversation API - Real-time emotional support
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
import time
from typing import Optional
from datetime import datetime, timezone

from ..database import get_db
from .. import models, schemas
from ..services.ai_service import EmotionalAIService
from ..services.murf_service import MurfVoiceService
from ..utils.auth import get_current_user

router = APIRouter(tags=["voice"])

# Initialize services
ai_service = EmotionalAIService()
voice_service = MurfVoiceService()


@router.post("/transcribe", response_model=schemas.VoiceTranscriptionResponse)
async def transcribe_audio(
    request: schemas.VoiceTranscriptionRequest,
    current_user: models.User = Depends(get_current_user)
):
    """
    Transcribe audio to text using Whisper API
    """
    try:
        # In production, use Whisper API to transcribe
        # For now, returning mock transcription
        return schemas.VoiceTranscriptionResponse(
            transcription="Mock transcription of audio",
            confidence=0.95,
            language=request.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/greeting")
async def get_greeting(
    personality_mode: str = "calm_mentor",
    current_user: models.User = Depends(get_current_user)
):
    """
    Get a personalized greeting with voice for the selected personality
    """
    try:
        greetings = {
            "calm_mentor": "Hello, I'm your Calm Mentor. I'm here to listen and support you. How are you feeling today?",
            "friendly_best_friend": "Hey there! I'm so happy to chat with you. What's on your mind today?",
            "soft_therapist": "Hello, I'm here to listen and support you. Take your time, and feel free to share what's on your mind.",
            "motivational_coach": "Hey! I'm your Motivational Coach, and I'm excited to support you today. What can we tackle together?",
            "mindfulness_guide": "Welcome. Let's take a moment together. How are you feeling right now?"
        }

        greeting_text = greetings.get(personality_mode, greetings["calm_mentor"])

        # Generate voice
        voice_result = await voice_service.generate_speech(
            text=greeting_text,
            personality_mode=personality_mode
        )

        print(f"[DEBUG] Greeting voice result: {voice_result}")

        return {
            "greeting": greeting_text,
            "audio_url": voice_result.get("audio_url"),
            "personality_mode": personality_mode
        }

    except Exception as e:
        print(f"[ERROR] Greeting generation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/send-message", response_model=dict)
async def send_voice_message(
    request: schemas.MessageCreate,
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Send a message and get AI response with voice
    """
    try:
        # Get or create conversation
        stmt = select(models.Conversation).where(
            (models.Conversation.id == conversation_id) &
            (models.Conversation.user_id == current_user.id)
        )
        conversation = await db.execute(stmt)
        conversation = conversation.scalar_one_or_none()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Save user message
        user_message = models.Message(
            conversation_id=conversation.id,
            sender_type="user",
            content=request.content,
            audio_url=request.audio_url,
            emotion_detected=request.emotion_detected,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(user_message)

        # Analyze emotion in user message
        emotion_data = await ai_service.analyze_emotion(request.content)
        print(f"[DEBUG] Emotion analysis result: {emotion_data}")

        user_message.emotion_detected = emotion_data.get("emotion")
        user_message.emotion_confidence = emotion_data.get("confidence", 0.0)
        user_message.sentiment_score = emotion_data.get("sentiment_score", 0.0)

        await db.flush()

        # Get AI response
        ai_response = await ai_service.generate_empathetic_response(
            user_message=request.content,
            personality_mode=conversation.personality_mode
        )
        print(f"[DEBUG] AI response: {ai_response}")

        # Generate voice for AI response
        voice_result = await voice_service.generate_speech(
            text=ai_response,
            personality_mode=conversation.personality_mode
        )
        print(f"[DEBUG] Voice generation result: {voice_result}")

        # Save AI message
        ai_message = models.Message(
            conversation_id=conversation.id,
            sender_type="ai",
            content=ai_response,
            audio_url=voice_result.get("audio_url"),
            emotion_detected="supportive",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(ai_message)

        # Update conversation metadata
        conversation.message_count += 2
        # Calculate actual duration in seconds
        if conversation.started_at:
            duration = (datetime.now(timezone.utc) - conversation.started_at).total_seconds()
            conversation.session_duration = int(duration)

        await db.commit()

        return {
            "ai_response": ai_response,
            "audio_url": voice_result.get("audio_url"),
            "emotion_detected": emotion_data.get("emotion"),
            "emotion_confidence": emotion_data.get("confidence"),
            "personality_mode": conversation.personality_mode
        }

    except Exception as e:
        print(f"[ERROR] Send message error: {str(e)}")
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/stream", response_class=StreamingResponse)
async def stream_voice_response(
    request: schemas.MessageCreate,
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Stream voice response for real-time playback
    """
    try:
        stmt = select(models.Conversation).where(
            (models.Conversation.id == conversation_id) &
            (models.Conversation.user_id == current_user.id)
        )
        conversation = await db.execute(stmt)
        conversation = conversation.scalar_one_or_none()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Generate AI response
        ai_response = await ai_service.generate_empathetic_response(
            user_message=request.content,
            personality_mode=conversation.personality_mode
        )

        # Stream voice
        return StreamingResponse(
            voice_service.generate_stream(
                text=ai_response,
                personality_mode=conversation.personality_mode
            ),
            media_type="audio/mpeg"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/personalities")
async def get_personalities(current_user: models.User = Depends(get_current_user)):
    """Get available AI personality modes"""
    return {
        "personalities": [
            {
                "id": "calm_mentor",
                "name": "Calm Mentor",
                "description": "A wise, gentle mentor providing thoughtful guidance"
            },
            {
                "id": "friendly_best_friend",
                "name": "Friendly Best Friend",
                "description": "Warm, relatable friend who truly listens"
            },
            {
                "id": "soft_therapist",
                "name": "Soft Therapist",
                "description": "Professional, empathetic therapist providing support"
            },
            {
                "id": "motivational_coach",
                "name": "Motivational Coach",
                "description": "Energetic coach inspiring you to reach your potential"
            },
            {
                "id": "mindfulness_guide",
                "name": "Mindfulness Guide",
                "description": "Peaceful guide helping you stay present and centered"
            }
        ]
    }


@router.post("/generate")
async def generate_voice(
    request: dict,
    current_user: models.User = Depends(get_current_user)
):
    """
    Generate voice response for given text and personality
    Perfect for testing voice generation independently
    """
    try:
        text = request.get("text")
        personality_mode = request.get("personality_mode", "calm_mentor")

        if not text:
            raise HTTPException(status_code=400, detail="Text is required")

        # Generate voice using Murf API
        result = await voice_service.generate_speech(
            text=text,
            personality_mode=personality_mode
        )

        if not result.get("success"):
            return {
                "status": "error",
                "error": result.get("error", "Voice generation failed"),
                "audio_url": None
            }

        return {
            "status": "success",
            "audio_url": result.get("audio_url"),
            "personality_mode": personality_mode,
            "voice_id": result.get("voice_id"),
            "text_length": len(text),
            "message": f"Voice generated successfully for {personality_mode}"
        }

    except Exception as e:
        print(f"Error generating voice: {e}")
        return {
            "status": "error",
            "error": str(e),
            "audio_url": None
        }


@router.get("/test-microphone")
async def test_microphone_endpoint(current_user: models.User = Depends(get_current_user)):
    """
    Backend endpoint to verify API is working
    Used by frontend to test connectivity
    """
    return {
        "status": "ready",
        "message": "✅ Backend API is running and accepting voice requests",
        "murf_configured": bool(voice_service.api_key),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

