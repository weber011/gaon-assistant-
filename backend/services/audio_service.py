import os
import io
from openai import OpenAI
from fastapi import UploadFile

class AudioService:
    def __init__(self):
        # Using Groq for STT since OpenAI key is missing
        api_key = os.getenv("GROQ_API_KEY", "")
        if api_key:
            self.client = OpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1"
            )
        else:
            self.client = None
            print("WARNING: GROQ_API_KEY is not set. Voice services will not work.")

    def speech_to_text(self, audio_file_path: str) -> str:
        """Converts audio to text using Groq Whisper."""
        if not self.client:
            print("No Groq client configured. Returning empty STT.")
            return ""
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model="whisper-large-v3",
                    file=audio_file,
                    language="hi"  # Optional: hint for Hindi
                )
            return transcription.text
        except Exception as e:
            print(f"Error in speech_to_text: {e}")
            return ""

    def text_to_speech(self, text: str, output_path: str):
        """Converts text to speech using OpenAI TTS."""
        if not self.client:
            print("No OpenAI client configured. Returning empty TTS.")
            return None
        try:
            response = self.client.audio.speech.create(
                model="tts-1",
                voice="onyx", # Onyx is a deep, warm male voice, fits "village elder" well
                input=text
            )
            response.stream_to_file(output_path)
            return output_path
        except Exception as e:
            print(f"Error in text_to_speech: {e}")
            return None
