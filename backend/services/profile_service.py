# In-memory storage for MVP
farmer_profiles = {
    "default": {
        "name": "Ramesh Kumar",
        "village": "Jamtara",
        "district": "Jamtara",
        "state": "Jharkhand",
        "language": "Hindi",
        "main_crop": "Tomato",
        "land_area": "2 acres",
        "soil_type": "Loamy",
        "preferred_mandi": "Jamtara"
    }
}

def get_farmer_profile(user_id: str = "default"):
    return farmer_profiles.get(user_id, {})

def update_farmer_profile(user_id: str, updates: dict):
    if user_id not in farmer_profiles:
        farmer_profiles[user_id] = {}
    farmer_profiles[user_id].update(updates)
    return farmer_profiles[user_id]
