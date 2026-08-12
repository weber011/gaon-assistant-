import os
import shutil
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.audio_service import AudioService

router = APIRouter()
audio_service = AudioService()

class TTSRequest(BaseModel):
    text: str

@router.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    # Save temp file
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process
    text = audio_service.speech_to_text(temp_file)
    
    # Cleanup
    if os.path.exists(temp_file):
        os.remove(temp_file)
        
    return {"text": text}

@router.post("/text-to-speech")
async def text_to_speech(request: TTSRequest):
    output_path = "temp_output.mp3"
    result = audio_service.text_to_speech(request.text, output_path)
    
    if not result or not os.path.exists(output_path):
        # Create a dummy silent mp3 or just return a 404
        # For hackathon MVP, just return the 404 to let frontend fail gracefully
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="TTS Service Unavailable (Missing API Key)")
        
    return FileResponse(
        path=output_path, 
        media_type="audio/mpeg", 
        filename="response.mp3"
    )
