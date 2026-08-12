from fastapi import APIRouter
from services.reminder_service import user_reminders

router = APIRouter()

@router.get("/reminders")
async def get_reminders(user_id: str = "default"):
    # Mock some upcoming reminders if none exist for demo purposes
    reminders = user_reminders.get(user_id, [])
    
    if not reminders:
        return {
            "reminders": [
                {"task": "खेत में सिंचाई", "time": "Today 5:00 PM", "status": "upcoming"},
                {"task": "फसल की जांच", "time": "Tomorrow 8:00 AM", "status": "upcoming"}
            ]
        }
        
    return {"reminders": reminders}
