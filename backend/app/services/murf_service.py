"""
Murf Falcon Voice Service - Natural AI voice generation
"""

import os
import httpx
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

MURF_API_URL = "https://api.murf.ai/v1/speech/generate"


class VoiceConfig:
    """Voice configuration for different personalities"""

    PERSONALITY_VOICES = {
        "calm_mentor": {
            "voice_id": "en-US-ryan",
            "pitch": -5,
            "rate": 0.8,
            "style": "Warm"
        },
        "friendly_best_friend": {
            "voice_id": "en-US-amber",
            "pitch": 2,
            "rate": 1.0,
            "style": "Cheerful"
        },
        "soft_therapist": {
            "voice_id": "en-US-joelle",
            "pitch": -2,
            "rate": 0.7,
            "style": "Professional"
        },
        "motivational_coach": {
            "voice_id": "en-US-josh",
            "pitch": 3,
            "rate": 1.1,
            "style": "Energetic"
        },
        "mindfulness_guide": {
            "voice_id": "en-US-nancy",
            "pitch": -3,
            "rate": 0.6,
            "style": "Calm"
        }
    }


class MurfVoiceService:
    """Service for generating natural voice responses"""

    def __init__(self):
        self.api_key = os.getenv("MURF_API_KEY")
        self.api_url = MURF_API_URL

    async def generate_speech(
        self,
        text: str,
        personality_mode: str = "calm_mentor",
        language: str = "en-US"
    ) -> Dict[str, Any]:
        """
        Generate speech using Murf Falcon API
        Returns: audio URL and metadata
        """
        if not self.api_key:
            print("ERROR: MURF_API_KEY not configured")
            return {
                "audio_url": None,
                "error": "Voice service not configured"
            }

        # Get voice configuration for personality
        voice_config = VoiceConfig.PERSONALITY_VOICES.get(
            personality_mode,
            VoiceConfig.PERSONALITY_VOICES["calm_mentor"]
        )

        headers = {
            "api-key": self.api_key,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        payload = {
            "voiceId": voice_config["voice_id"],
            "text": text,
            "rate": voice_config["rate"],
            "pitch": voice_config["pitch"],
            "style": voice_config["style"],
            "sampleRate": 48000,
            "format": "MP3",
            "channelType": "MONO"
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()

                data = response.json()

                return {
                    "audio_url": data.get("audioFile"),
                    "personality_mode": personality_mode,
                    "voice_id": voice_config["voice_id"],
                    "success": True
                }

        except httpx.HTTPError as e:
            print(f"HTTP Error calling Murf API: {e}")
            return {
                "audio_url": None,
                "error": f"Voice generation failed: {str(e)}",
                "success": False
            }
        except Exception as e:
            print(f"Error generating speech: {e}")
            return {
                "audio_url": None,
                "error": str(e),
                "success": False
            }

    async def generate_stream(
        self,
        text: str,
        personality_mode: str = "calm_mentor"
    ):
        """Generate speech with streaming for real-time playback"""
        if not self.api_key:
            raise Exception("Voice service not configured")

        voice_config = VoiceConfig.PERSONALITY_VOICES.get(
            personality_mode,
            VoiceConfig.PERSONALITY_VOICES["calm_mentor"]
        )

        headers = {
            "api-key": self.api_key,
            "Accept": "audio/mpeg",
            "Content-Type": "application/json"
        }

        payload = {
            "voiceId": voice_config["voice_id"],
            "text": text,
            "rate": voice_config["rate"],
            "pitch": voice_config["pitch"],
            "style": voice_config["style"],
            "sampleRate": 48000,
            "format": "MP3",
            "channelType": "MONO"
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    self.api_url,
                    json=payload,
                    headers=headers
                ) as response:
                    response.raise_for_status()
                    async for chunk in response.aiter_bytes():
                        yield chunk

        except Exception as e:
            print(f"Error in voice streaming: {e}")
            raise

    async def get_available_voices(self) -> list:
        """Get list of available voices"""
        return list(VoiceConfig.PERSONALITY_VOICES.keys())

