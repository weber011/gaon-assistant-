from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
import os
import json
import time

router = APIRouter()

# In-memory history for MVP
crop_history = []

@router.post("/crop/analyze")
async def analyze_crop(image: UploadFile = File(...), crop: str = Form(...), user_id: str = Form("default")):
    """
    Analyzes an uploaded crop image.
    For the MVP Demo, this returns a structured mock response for Tomato/Wheat/Rice, etc.
    """
    
    # 1. Simulate processing delay
    time.sleep(2)
    
    # 2. Mock analysis logic based on crop
    result = {
        "crop": crop,
        "possible_problem": "Early Blight" if crop.lower() in ["tomato", "टमाटर"] else "Leaf Spot",
        "confidence": 0.87,
        "severity": "medium",
        "symptoms": [
            "पत्तियों पर गहरे धब्बे (Dark spots on leaves)",
            "प्रभावित हिस्से के आसपास पीलापन (Yellowing around affected areas)"
        ],
        "recommendations": [
            "प्रभावित पत्तियों को तुरंत अलग करें।",
            "खेत में हवा का आवागमन सही रखें।",
            "अनावश्यक नमी से बचें।"
        ],
        "needs_expert": False,
        "is_demo_data": True,
        "disclaimer": "AI का प्रारंभिक अनुमान"
    }
    
    # 3. Save to history
    history_record = {
        "id": f"scan_{int(time.time())}",
        "user_id": user_id,
        "crop": crop,
        "possible_problem": result["possible_problem"],
        "date": "Today",
        "status": "Monitoring",
        "is_demo_data": True
    }
    crop_history.append(history_record)
    
    return result

@router.get("/crop/history")
async def get_history(user_id: str = "default"):
    return {"history": [h for h in crop_history if h["user_id"] == user_id]}
