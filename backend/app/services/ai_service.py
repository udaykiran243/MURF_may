"""
AI Service - Emotional AI Engine using OpenAI/Gemini
"""

import os
import json
from typing import Optional, Dict, Any
from openai import OpenAI
from datetime import datetime


class EmotionalAIService:
    """Service for emotional AI responses"""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-3.5-turbo"

    async def analyze_emotion(self, text: str) -> Dict[str, Any]:
        """
        Analyze emotion from user text
        Returns: emotion type, confidence, sentiment score
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an emotional analysis expert. 
                        Analyze the user's text and respond with JSON containing:
                        - emotion: detected emotion (anxiety, stress, joy, sadness, etc.)
                        - confidence: confidence level (0-1)
                        - sentiment_score: sentiment score (-1 to 1)
                        - intensity: emotional intensity (1-10)
                        """
                    },
                    {"role": "user", "content": text}
                ],
                temperature=0.7,
                max_tokens=200
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            print(f"Error analyzing emotion: {e}")
            return {
                "emotion": "neutral",
                "confidence": 0.5,
                "sentiment_score": 0.0,
                "intensity": 5
            }

    async def generate_empathetic_response(
        self,
        user_message: str,
        personality_mode: str = "calm_mentor",
        emotional_context: Optional[Dict] = None
    ) -> str:
        """
        Generate empathetic AI response based on personality mode
        """
        personality_prompts = {
            "calm_mentor": "You are a calm, wise mentor. Respond with gentle wisdom and encouragement.",
            "friendly_best_friend": "You are a warm, supportive best friend. Respond with empathy and relatability.",
            "soft_therapist": "You are a gentle, professional therapist. Respond with clinical empathy and validation.",
            "motivational_coach": "You are an energetic, motivational coach. Respond with inspiration and actionable advice.",
            "mindfulness_guide": "You are a mindfulness expert. Respond with peaceful, present-moment awareness."
        }

        personality_fallbacks = {
            "calm_mentor": "I hear you. That sounds challenging. Remember, you have the strength within you to navigate this. What would feel most supportive right now?",
            "friendly_best_friend": "I'm really listening. You matter, and what you're feeling is valid. I'm here for you, always.",
            "soft_therapist": "Thank you for sharing that with me. Your feelings are important and worth exploring. Let's take this one step at a time.",
            "motivational_coach": "You've got this! Every challenge is an opportunity to grow stronger. What's one small step you can take right now?",
            "mindfulness_guide": "Let's pause and breathe together. Notice what you're feeling without judgment. You are safe in this moment."
        }

        try:
            system_prompt = f"""{personality_prompts.get(personality_mode, personality_prompts['calm_mentor'])}
            
            Guidelines:
            - Be deeply empathetic and emotionally intelligent
            - Avoid robotic or generic responses
            - Use natural, conversational language
            - Keep response concise (2-3 sentences)
            - Never suggest replacing professional therapy
            - Respond in a warm, human-like manner
            """

            if emotional_context:
                system_prompt += f"\nUser's recent emotional patterns: {json.dumps(emotional_context)}"

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.8,
                max_tokens=300
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error generating response: {e}")
            # Return personality-specific fallback response
            return personality_fallbacks.get(personality_mode, "I'm here to listen and support you. Take your time, and feel free to share what's on your mind.")

    async def generate_affirmation(self, mood: str, intensity: int = 5) -> str:
        """Generate personalized affirmation based on mood"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """Generate a powerful, personalized affirmation. 
                        Make it:
                        - Positive and empowering
                        - Specific to the emotion
                        - Realistic and believable
                        - Warm and supportive
                        Keep it to 1-2 sentences."""
                    },
                    {
                        "role": "user",
                        "content": f"Generate an affirmation for someone feeling {mood} (intensity: {intensity}/10)"
                    }
                ],
                temperature=0.9,
                max_tokens=100
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error generating affirmation: {e}")
            return "You are stronger than you know, and this feeling will pass."

    async def analyze_conversation_patterns(self, messages: list) -> Dict[str, Any]:
        """Analyze conversation patterns for insights"""
        try:
            text_content = " ".join([msg.get("content", "") for msg in messages])

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """Analyze this conversation and provide insights. 
                        Response should be JSON with:
                        - main_themes: list of main emotional themes
                        - suggested_techniques: suggested coping techniques
                        - emotional_trajectory: how emotion progressed
                        - key_insights: important insights"""
                    },
                    {"role": "user", "content": f"Analyze: {text_content[:2000]}"}
                ],
                temperature=0.7,
                max_tokens=400
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            print(f"Error analyzing patterns: {e}")
            return {
                "main_themes": [],
                "suggested_techniques": [],
                "emotional_trajectory": "stable",
                "key_insights": []
            }

    async def detect_crisis_language(self, text: str) -> Dict[str, Any]:
        """Detect if text contains crisis language"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """Analyze if this text contains crisis language or harmful intent. 
                        Response as JSON with:
                        - is_crisis: boolean
                        - severity: low/medium/high/critical
                        - reasoning: brief explanation
                        - recommended_action: what to do"""
                    },
                    {"role": "user", "content": text}
                ],
                temperature=0.3,  # Lower temperature for consistency
                max_tokens=200
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            print(f"Error detecting crisis: {e}")
            return {
                "is_crisis": False,
                "severity": "low",
                "reasoning": "Unable to analyze",
                "recommended_action": "continue_session"
            }

