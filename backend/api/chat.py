from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_agent import agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"

from typing import Optional

class ChatResponse(BaseModel):
    reply: str
    intent: str = "general"
    data: Optional[dict] = None

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    result = agent.process_message(request.message, request.user_id)
    return ChatResponse(
        reply=result["reply"], 
        intent=result["intent"],
        data=result.get("data")
    )
