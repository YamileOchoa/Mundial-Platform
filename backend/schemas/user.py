from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    nombre: str
    email: str
    foto_url: Optional[str] = None
    es_admin_global: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    foto_url: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UserStats(BaseModel):
    total_predicciones: int
    partidos_ganador_correcto: int
    puntos_totales: int
    racha_maxima_actual: int