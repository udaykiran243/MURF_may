"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72, description="Password must be 8-72 characters (bcrypt limit)")
    full_name: str = Field(..., min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    language_preference: str
    preferred_personality: str
    dark_mode: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int


# Message Schemas
class MessageCreate(BaseModel):
    content: str
    audio_url: Optional[str] = None
    emotion_detected: Optional[str] = None


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_type: str
    content: str
    audio_url: Optional[str] = None
    emotion_detected: Optional[str] = None
    emotion_confidence: float
    sentiment_score: float
    timestamp: datetime

    class Config:
        from_attributes = True


# Conversation Schemas
class ConversationCreate(BaseModel):
    personality_mode: str = "calm_mentor"
    mood_at_start: Optional[str] = None


class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    personality_mode: str
    mood_at_start: Optional[str] = None
    mood_at_end: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    message_count: int
    session_duration: int
    summary: Optional[str] = None

    class Config:
        from_attributes = True


# Voice Schemas
class VoiceTranscriptionRequest(BaseModel):
    audio_data: str  # base64 encoded audio
    language: str = "en"


class VoiceTranscriptionResponse(BaseModel):
    transcription: str
    confidence: float
    language: str


class VoiceResponse(BaseModel):
    response_text: str
    audio_url: str
    personality_mode: str
    emotion_expressed: str


# Mood Schemas
class MoodEntryCreate(BaseModel):
    mood: str
    intensity: int = Field(default=5, ge=1, le=10)
    notes: Optional[str] = None
    triggers: Optional[List[str]] = None
    activities: Optional[List[str]] = None


class MoodEntryResponse(BaseModel):
    id: int
    user_id: int
    mood: str
    intensity: int
    notes: Optional[str] = None
    triggers: List[str]
    activities: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Journal Schemas
class JournalEntryCreate(BaseModel):
    title: Optional[str] = None
    content: str = Field(..., min_length=10)
    mood: Optional[str] = None
    gratitude_items: Optional[List[str]] = None
    is_private: bool = True


class JournalEntryResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    content: str
    mood: Optional[str] = None
    gratitude_items: List[str]
    emotional_insights: Optional[str] = None
    ai_generated_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Affirmation Schemas
class AffirmationCreate(BaseModel):
    content: str
    category: Optional[str] = None


class AffirmationResponse(BaseModel):
    id: int
    user_id: int
    content: str
    category: Optional[str] = None
    used_count: int
    is_custom: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Emotional Profile Schemas
class EmotionalProfileResponse(BaseModel):
    id: int
    user_id: int
    primary_concern: Optional[str] = None
    emotional_patterns: Dict[str, Any]
    favorite_calming_methods: List[str]
    recurring_stress_topics: List[str]
    empathy_score: float
    resilience_score: float
    emotional_stability: float

    class Config:
        from_attributes = True


# Therapy Session Schemas
class TherapySessionCreate(BaseModel):
    session_type: str
    duration: int = 0
    effectiveness_rating: Optional[float] = None
    notes: Optional[str] = None


class TherapySessionResponse(BaseModel):
    id: int
    user_id: int
    session_type: str
    duration: int
    effectiveness_rating: Optional[float] = None
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Analytics Schemas
class EmotionAnalyticsResponse(BaseModel):
    period: str
    mood_distribution: Dict[str, int]
    average_emotional_intensity: float
    most_common_triggers: List[str]
    improvement_areas: List[str]
    successful_coping_methods: List[str]


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    total_sessions: int
    avg_daily_sessions: float

