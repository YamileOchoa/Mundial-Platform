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
    token_type: str = "bearer"