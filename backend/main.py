from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Gaon Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.chat import router as chat_router
from api.voice import router as voice_router

@app.get("/")
def read_root():
    return {"message": "Gaon Assistant API is running"}

app.include_router(chat_router, prefix="/api")
app.include_router(voice_router, prefix="/api")

