from services.ai_agent import IntentData

def fetch_schemes(intent_data: IntentData, user_id: str):
    """
    Retrieves government scheme information.
    For the MVP, this searches a static knowledge base.
    """
    # Mock data
    return {
        "schemes": [
            {
                "name": "PM-KISAN",
                "benefits": "₹6,000 per year in three equal installments",
                "eligibility": "Small and marginal farmers",
                "is_demo_data": True
            }
        ]
    }
