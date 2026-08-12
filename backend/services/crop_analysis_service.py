from services.ai_agent import IntentData

def analyze_crop_disease(intent_data: IntentData, user_id: str):
    """
    Analyzes crop disease based on symptoms or image.
    For MVP, just returns structured mock response simulating Vision output.
    """
    crop = intent_data.commodity or "Unknown Crop"
    
    # In a full flow, we'd take the image and pass it to Gemini Vision here
    return {
        "crop": crop,
        "possible_problem": "Early Blight",
        "confidence": 0.87,
        "symptoms": intent_data.symptoms or ["Dark spots on leaves", "Yellowing leaves"],
        "recommendations": [
            "Remove severely affected leaves",
            "Improve airflow",
            "Avoid excessive moisture"
        ],
        "disclaimer": True,
        "is_demo_data": True
    }
