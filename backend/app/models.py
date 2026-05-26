"""
Database models for SereneMind AI
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base


class PersonalityMode(str, enum.Enum):
    """AI therapist personality modes"""
    CALM_MENTOR = "calm_mentor"
    FRIENDLY_BEST_FRIEND = "friendly_best_friend"
    SOFT_THERAPIST = "soft_therapist"
    MOTIVATIONAL_COACH = "motivational_coach"
    MINDFULNESS_GUIDE = "mindfulness_guide"


class MoodType(str, enum.Enum):
    """User mood types"""
    ANXIETY = "anxiety"
    STRESS = "stress"
    LONELINESS = "loneliness"
    BURNOUT = "burnout"
    SADNESS = "sadness"
    PANIC_ATTACKS = "panic_attacks"
    OVERTHINKING = "overthinking"
    MOTIVATION_LOSS = "motivation_loss"
    JOY = "joy"
    CALM = "calm"
    ENERGIZED = "energized"
    NEUTRAL = "neutral"


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    language_preference = Column(String, default="English")
    preferred_personality = Column(String, default="calm_mentor")
    dark_mode = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    emotional_profile = relationship("EmotionalProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    mood_entries = relationship("MoodEntry", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    affirmations = relationship("Affirmation", back_populates="user", cascade="all, delete-orphan")
    therapy_sessions = relationship("TherapySession", back_populates="user", cascade="all, delete-orphan")


class EmotionalProfile(Base):
    """User emotional profile and patterns"""
    __tablename__ = "emotional_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    primary_concern = Column(String, nullable=True)
    emotional_patterns = Column(JSON, default={})
    favorite_calming_methods = Column(JSON, default=[])
    recurring_stress_topics = Column(JSON, default=[])
    empathy_score = Column(Float, default=0.0)
    resilience_score = Column(Float, default=0.0)
    emotional_stability = Column(Float, default=0.5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    user = relationship("User", back_populates="emotional_profile")


class Conversation(Base):
    """Conversation history"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)
    personality_mode = Column(String, default="calm_mentor")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    mood_at_start = Column(String, nullable=True)
    mood_at_end = Column(String, nullable=True)
    emotional_intensity = Column(Float, default=0.5)
    summary = Column(Text, nullable=True)
    session_duration = Column(Integer, default=0)  # in seconds
    message_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    ai_memories = relationship("AiMemory", back_populates="conversation", cascade="all, delete-orphan")
    transcripts = relationship("Transcript", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """Chat messages"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_type = Column(String, nullable=False)  # "user" or "ai"
    content = Column(Text, nullable=False)
    audio_url = Column(String, nullable=True)
    emotion_detected = Column(String, nullable=True)
    emotion_confidence = Column(Float, default=0.0)
    sentiment_score = Column(Float, default=0.0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    conversation = relationship("Conversation", back_populates="messages")


class MoodEntry(Base):
    """Daily mood tracking"""
    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood = Column(String, nullable=False)
    intensity = Column(Integer, default=5)  # 1-10
    notes = Column(Text, nullable=True)
    triggers = Column(JSON, default=[])
    activities = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="mood_entries")


class JournalEntry(Base):
    """Emotional journal"""
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    mood = Column(String, nullable=True)
    gratitude_items = Column(JSON, default=[])
    emotional_insights = Column(Text, nullable=True)
    ai_generated_response = Column(Text, nullable=True)
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    user = relationship("User", back_populates="journal_entries")


class Affirmation(Base):
    """AI-generated affirmations"""
    __tablename__ = "affirmations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=True)
    used_count = Column(Integer, default=0)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="affirmations")


class TherapySession(Base):
    """Structured therapy sessions"""
    __tablename__ = "therapy_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_type = Column(String, nullable=False)  # meditation, breathing, journal, etc.
    duration = Column(Integer, default=0)  # in seconds
    effectiveness_rating = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship
    user = relationship("User", back_populates="therapy_sessions")


class AiMemory(Base):
    """AI conversation memories"""
    __tablename__ = "ai_memories"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    memory_type = Column(String, nullable=False)  # emotional_pattern, preference, concern, etc.
    memory_content = Column(Text, nullable=False)
    relevance_score = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    conversation = relationship("Conversation", back_populates="ai_memories")


class Transcript(Base):
    __tablename__ = "transcripts"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    sender = Column(String) # 'user' or 'ai'
    text = Column(Text)
    language = Column(String, default="en-US")
    audio_url = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    conversation = relationship("Conversation", back_populates="transcripts")
