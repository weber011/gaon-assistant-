from services.ai_agent import IntentData

def fetch_mandi_price(intent_data: IntentData, user_id: str):
    """
    Fetches mandi prices. Using a seeded demo database for the hackathon MVP.
    """
    commodity = intent_data.commodity or "Unknown"
    location = intent_data.location or "Jamtara"
    
    # Mock database lookup
    # In a real app, this would query a government API or scraped data
    
    return {
        "commodity": commodity,
        "market": location,
        "min_price": 1200,
        "max_price": 1800,
        "modal_price": 1500,
        "unit": "₹/quintal",
        "updated_at": "Today",
        "source": "AGMARKNET (Demo)",
        "is_demo_data": True
    }
