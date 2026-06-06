from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RoomCreate(BaseModel):
    nombre: str

class RoomJoin(BaseModel):
    codigo_invitacion: str

class RoomResponse(BaseModel):
    id: int
    nombre: str
    codigo_invitacion: str
    admin_id: int
    created_at: datetime

    class Config:
        from_attributes = True