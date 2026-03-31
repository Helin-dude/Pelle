from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CameraSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    camera_id: str
    user_id: str
    brightness: int = 50
    contrast: int = 50
    stream_url: Optional[str] = None

class CameraSettingsUpdate(BaseModel):
    brightness: Optional[int] = None
    contrast: Optional[int] = None
    stream_url: Optional[str] = None

class AlertSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    motion_enabled: bool = True
    sound_enabled: bool = True
    sound_sensitivity: int = 50

class AlertSettingsUpdate(BaseModel):
    motion_enabled: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    sound_sensitivity: Optional[int] = None

# ============ AUTH HELPERS ============

async def get_current_user(request: Request) -> User:
    """Get current user from session token (cookie or header)"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return User(**user_doc)

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id for session_token and set cookie"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth to get session data
    async with httpx.AsyncClient() as client_http:
        auth_response = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
    
    if auth_response.status_code != 200:
        logger.error(f"Auth failed: {auth_response.text}")
        raise HTTPException(status_code=401, detail="Invalid session_id")
    
    auth_data = auth_response.json()
    email = auth_data["email"]
    name = auth_data["name"]
    picture = auth_data.get("picture")
    session_token = auth_data["session_token"]
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data if needed
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        
        # Create default camera settings for new user
        for camera_id in ["pelle", "printer"]:
            await db.camera_settings.insert_one({
                "camera_id": camera_id,
                "user_id": user_id,
                "brightness": 50,
                "contrast": 50,
                "stream_url": None
            })
        
        # Create default alert settings
        await db.alert_settings.insert_one({
            "user_id": user_id,
            "motion_enabled": True,
            "sound_enabled": True
        })
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    # Return user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user data"""
    user = await get_current_user(request)
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    return {"message": "Logged out"}

# ============ CAMERA ENDPOINTS ============

@api_router.get("/cameras/settings/{camera_id}")
async def get_camera_settings(camera_id: str, request: Request):
    """Get settings for a specific camera"""
    user = await get_current_user(request)
    
    settings = await db.camera_settings.find_one(
        {"camera_id": camera_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not settings:
        # Create default settings
        default_settings = {
            "camera_id": camera_id,
            "user_id": user.user_id,
            "brightness": 50,
            "contrast": 50,
            "stream_url": None
        }
        await db.camera_settings.insert_one(default_settings)
        
        # Fetch the inserted document with proper projection
        settings = await db.camera_settings.find_one(
            {"camera_id": camera_id, "user_id": user.user_id},
            {"_id": 0}
        )
    
    return settings

@api_router.put("/cameras/settings/{camera_id}")
async def update_camera_settings(camera_id: str, update: CameraSettingsUpdate, request: Request):
    """Update settings for a specific camera"""
    user = await get_current_user(request)
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    await db.camera_settings.update_one(
        {"camera_id": camera_id, "user_id": user.user_id},
        {"$set": update_data},
        upsert=True
    )
    
    settings = await db.camera_settings.find_one(
        {"camera_id": camera_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    return settings

# ============ ALERT ENDPOINTS ============

@api_router.get("/alerts/settings")
async def get_alert_settings(request: Request):
    """Get alert settings for user"""
    user = await get_current_user(request)
    
    settings = await db.alert_settings.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not settings:
        default_settings = {
            "user_id": user.user_id,
            "motion_enabled": True,
            "sound_enabled": True,
            "sound_sensitivity": 50
        }
        await db.alert_settings.insert_one(default_settings)
        
        # Fetch the inserted document with proper projection
        settings = await db.alert_settings.find_one(
            {"user_id": user.user_id},
            {"_id": 0}
        )
    
    return settings

@api_router.put("/alerts/settings")
async def update_alert_settings(update: AlertSettingsUpdate, request: Request):
    """Update alert settings"""
    user = await get_current_user(request)
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    await db.alert_settings.update_one(
        {"user_id": user.user_id},
        {"$set": update_data},
        upsert=True
    )
    
    settings = await db.alert_settings.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    return settings

# ============ STATUS ENDPOINT ============

@api_router.get("/")
async def root():
    return {"message": "CCTV Monitor API", "status": "online"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
