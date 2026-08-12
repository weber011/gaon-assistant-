import datetime

# In-memory storage for MVP
conversations = {}

def add_message(user_id: str, role: str, text: str, intent: str = None, tool_used: str = None):
    if user_id not in conversations:
        conversations[user_id] = []
        
    conversations[user_id].append({
        "role": role,
        "text": text,
        "intent": intent,
        "tool_used": tool_used,
        "timestamp": datetime.datetime.now().isoformat()
    })

def get_conversation_history(user_id: str, limit: int = 10):
    if user_id not in conversations:
        return []
    return conversations[user_id][-limit:]
