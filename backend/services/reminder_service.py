from services.ai_agent import IntentData

# Simple in-memory storage for MVP
user_reminders = {}

def create_reminder(intent_data: IntentData, user_id: str):
    """
    Creates a reminder for the farmer.
    """
    task = intent_data.task or "kheti ka kaam"
    time_date = intent_data.date_time or "kuch der baad"
    
    if user_id not in user_reminders:
        user_reminders[user_id] = []
        
    user_reminders[user_id].append({
        "task": task,
        "time": time_date
    })
    
    return {
        "status": "success",
        "task": task,
        "date_time": time_date,
        "message": f"Reminder set for {task} at {time_date}"
    }
