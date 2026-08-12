from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_agent import agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"

class ChatResponse(BaseModel):
    reply: str
    intent: str = "general"

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    reply = agent.process_message(request.message, request.user_id)
    return ChatResponse(reply=reply, intent="general")
