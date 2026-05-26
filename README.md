# 🧠 SereneMind AI - Emotional Support & Therapy Companion

A **production-ready AI-powered emotional support and therapy companion** web application built with **Next.js 14, FastAPI, PostgreSQL, and Murf Falcon Voice AI**.

> Providing deeply empathetic, emotionally intelligent AI conversations that feel genuinely comforting and human-like.

[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)]()
[![Python](https://img.shields.io/badge/Python-3.11-blue)]()

## ✨ Features

### 🎙️ Real-Time Voice Therapy
- **Natural voice conversations** powered by Murf Falcon voices
- **Emotionally expressive responses** with realistic pacing
- **Streaming audio** for seamless playback
- **Push-to-talk microphone** with animated waveforms

### 🧬 Intelligent Emotional AI Engine
- Detects emotions from voice/text with confidence scores
- Responds with genuine empathy and understanding
- Remembers emotional patterns and context
- Adapts tone to user's emotional state
- Safety checks for crisis language

### 🎭 5 Personality Modes
- **Calm Mentor** - Wise, gentle guidance
- **Friendly Best Friend** - Warm, relatable support  
- **Soft Therapist** - Professional, clinical empathy
- **Motivational Coach** - Energetic inspiration
- **Mindfulness Guide** - Peaceful presence

### 💫 Premium Futuristic UI
- Glassmorphism with transparent layers
- Animated gradients and ambient glow
- Floating 3D microphone orb
- Dark luxury Apple-inspired aesthetics
- Smooth animations at 60fps

### 📊 Comprehensive Wellness Features
- **Mood tracking** with emotion analytics
- **Gratitude journaling** with AI insights
- **Meditation sessions** and breathing exercises
- **Emotional growth dashboard**
- **Conversation summaries** and insights

### 🔒 Enterprise-Grade Security
- JWT authentication with secure tokens
- Backend API proxy (never expose keys)
- Password hashing with bcrypt
- CORS protection
- Environment variable management
- SQL injection prevention

## 🏗️ System Architecture

```
SereneMind AI
│
├── Frontend (Next.js 14 + React 18)
│   ├── Landing page with hero animations
│   ├── Auth pages (login/signup)
│   ├── Therapy chat interface
│   ├── Wellness dashboard
│   ├── Mood tracking
│   ├── Journal & notes
│   └── User profile
│
├── Backend (FastAPI + Python 3.11)
│   ├── Authentication service (JWT)
│   ├── Emotional AI engine (OpenAI/Gemini)
│   ├── Voice processing (Whisper)
│   ├── Murf Falcon voice generation
│   ├── Conversation management
│   ├── Mood & emotion tracking
│   └── Analytics engine
│
└── Database (PostgreSQL)
    ├── Users & sessions
    ├── Conversations & messages
    ├── Mood entries
    ├── Journal entries
    ├── Emotional profiles
    └── AI memories
```

## 🚀 Quick Start Guide

### Prerequisites
```
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Git
```

### 1. Clone Repository
```bash
git clone <repository-url>
cd MURF
```

### 2. Backend Setup (15 min)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Copy environment template
cp .env.example .env

# Edit .env with your API keys and database
nano .env

# Install dependencies
pip install -r requirements.txt

# Run migrations (if using Alembic)
# alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend running at**: http://localhost:8000

### 3. Frontend Setup (10 min)

```bash
cd ../frontend

# Copy environment
cp .env.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend running at**: http://localhost:3000
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Note on API Keys
- Never expose your `.env` files in version control.
- Verify you do not expose backend-specific keys to the frontend Next.js app.
- For production, use secure environment variables on Vercel/Render.

## Deployment
- **Frontend**: Deploy perfectly on [Vercel](https://vercel.com). Just import the `frontend` folder. Map environment variables in the project settings.
- **Backend**: Deploy on [Render](https://render.com) or Heroku using the FastAPI configuration.
