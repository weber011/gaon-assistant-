from services.ai_agent import IntentData

def analyze_crop_disease(intent_data: IntentData, user_id: str):
    """
    Analyzes crop disease based on symptoms or image.
    For MVP, just returns structured mock response simulating Vision output.
    """
    crop = intent_data.commodity or "Unknown Crop"
    
    # In a full flow, we'd take the image and pass it to Gemini Vision here
    return {
        "action_required": "upload_photo",
        "crop": crop,
        "message": f"जी, {crop} के पत्ते या फल की एक साफ फोटो भेजिए ताकि मैं जांच कर सकूँ।"
    }
