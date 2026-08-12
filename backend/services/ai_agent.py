import json
import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import Optional, List, Any

# Configure API Key
_api_key = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=_api_key) if _api_key else None

class IntentData(BaseModel):
    intent: str = Field(description="The primary intent: WEATHER, MANDI_PRICE, GOVERNMENT_SCHEME, CROP_DISEASE, REMINDER, or GENERAL_CONVERSATION")
    commodity: Optional[str] = Field(default=None, description="The crop or commodity mentioned, if any")
    location: Optional[str] = Field(default=None, description="The location or mandi mentioned, if any")
    date_time: Optional[str] = Field(default=None, description="Any specific time or date mentioned, if any")
    task: Optional[str] = Field(default=None, description="The task for a reminder, if any")
    symptoms: Optional[List[str]] = Field(default=None, description="Symptoms of a crop disease mentioned, if any")

from services.weather_service import fetch_weather
from services.mandi_service import fetch_mandi_price
from services.scheme_service import fetch_schemes
from services.crop_analysis_service import analyze_crop_disease
from services.reminder_service import create_reminder

class AIAgent:
    def __init__(self):
        self.tools = {}
        self.register_tool("WEATHER", fetch_weather)
        self.register_tool("MANDI_PRICE", fetch_mandi_price)
        self.register_tool("GOVERNMENT_SCHEME", fetch_schemes)
        self.register_tool("CROP_DISEASE", analyze_crop_disease)
        self.register_tool("REMINDER", create_reminder)

    def register_tool(self, intent_name: str, tool_function):
        self.tools[intent_name] = tool_function

    def detect_intent(self, text: str, context: list = None) -> IntentData:
        if not client:
            return IntentData(intent="GENERAL_CONVERSATION")

        prompt = f"""You are an intent classifier for an Indian agricultural assistant.
Analyze this farmer's message and respond ONLY with valid JSON matching the schema.

Message: "{text}"

Intent must be one of: WEATHER, MANDI_PRICE, GOVERNMENT_SCHEME, CROP_DISEASE, REMINDER, GENERAL_CONVERSATION
Extract commodity (crop name), location (village/city/mandi), if present.

Respond with JSON only."""

        try:
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=IntentData,
                )
            )
            return IntentData.model_validate_json(response.text)
        except Exception as e:
            print(f"Error detecting intent: {e}")
            return IntentData(intent="GENERAL_CONVERSATION")

    def generate_final_response(self, text: str, intent_data: IntentData, tool_result: Any) -> str:
        if not client:
            return "माफ़ कीजिये, Gemini API Key सेट नहीं है। कृपया .env फाइल में GEMINI_API_KEY डालें।"

        prompt = f"""You are Gaon Assistant (गाँव असिस्टेंट), a warm and knowledgeable AI agricultural companion for Indian farmers.
You speak like an experienced village elder — patient, simple, and caring.
Always respond in simple Hindi or Hinglish matching the farmer's language.
Keep your answer short (2-4 sentences max), clear, and directly helpful.
Never use complicated technical terms. Use everyday words.

Farmer's Message: "{text}"
Intent: {intent_data.intent}
Data from tools: {json.dumps(tool_result, ensure_ascii=False) if tool_result else "None"}

If tool data is available, use it to give a specific, factual answer.
If no data, give general helpful farming advice in Hindi."""

        try:
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error generating response: {e}")
            return "माफ़ कीजिये, अभी मुझे समझने में कुछ परेशानी हो रही है। थोड़ी देर बाद फिर पूछें।"

    def process_message(self, text: str, user_id: str = "default") -> str:
        from services.conversation_service import add_message, get_conversation_history
        from services.profile_service import get_farmer_profile

        profile = get_farmer_profile(user_id)
        history = get_conversation_history(user_id)

        # 1. Detect Intent
        intent_data = self.detect_intent(text, context=history)
        print(f"Detected Intent: {intent_data.model_dump_json()}")

        # 2. Select and Execute Tool
        tool_result = None
        if intent_data.intent in self.tools:
            tool_func = self.tools[intent_data.intent]
            if not intent_data.location and profile.get("village"):
                intent_data.location = profile["village"]
            if not intent_data.commodity and profile.get("main_crop"):
                intent_data.commodity = profile["main_crop"]
            tool_result = tool_func(intent_data, user_id)

        # 3. Generate Final Response
        final_response = self.generate_final_response(text, intent_data, tool_result)

        # 4. Save to history
        add_message(user_id, "user", text, intent=intent_data.intent, tool_used=intent_data.intent if tool_result else None)
        add_message(user_id, "assistant", final_response)

        return final_response

# Global instance
agent = AIAgent()
