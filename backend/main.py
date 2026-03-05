from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ml_engine import ml_predict
from database import init_db, save_prediction, get_all_history
from auth_db import init_auth_db, create_user, verify_user
from typing import Optional

app = FastAPI()

init_db()
init_auth_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MLInputData(BaseModel):
    soil_n: float
    soil_p: float
    soil_k: float
    temperature: float
    humidity: float
    moisture: float
    soil_type: str
    crop_type: str
    ph: Optional[float] = 7.0
    rainfall: Optional[float] = 100.0
    area: float

class RegisterData(BaseModel):
    username: str
    email: str
    password: str

class LoginData(BaseModel):
    username: str
    password: str

@app.get("/")
def home():
    return {"message": "FarmAI ML API Running"}

@app.post("/recommend")
def recommend(data: MLInputData):
    result = ml_predict(
        soil_n=data.soil_n,
        soil_p=data.soil_p,
        soil_k=data.soil_k,
        temperature=data.temperature,
        humidity=data.humidity,
        moisture=data.moisture,
        soil_type=data.soil_type,
        crop_type=data.crop_type,
        ph=data.ph,
        rainfall=data.rainfall,
        area=data.area,
    )
    save_prediction(result, data.dict())
    return result

@app.get("/history")
def history():
    return get_all_history()

@app.post("/register")
def register(data: RegisterData):
    if len(data.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    result = create_user(data.username, data.email, data.password)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "Account created successfully"}

@app.post("/login")
def login(data: LoginData):
    result = verify_user(data.username, data.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    return {"message": "Login successful", "user": result["user"]}

@app.get("/meta")
def meta():
    return {
        "soil_types": ["Sandy", "Loamy", "Black", "Red", "Clayey"],
        "crop_types": ["Paddy", "Wheat", "Maize", "Cotton", "Sugarcane", "Barley", "Millets", "Pulses", "Oil seeds", "Tobacco", "Ground Nuts"],
    }
