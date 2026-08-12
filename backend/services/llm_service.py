import os
from google import genai
from google.genai import types

class LLMService:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    def get_chat_response(self, prompt: str, system_instruction: str = None) -> str:
        config = types.GenerateContentConfig()
        if system_instruction:
            config.system_instruction = system_instruction
        
        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=config
        )
        return response.text
