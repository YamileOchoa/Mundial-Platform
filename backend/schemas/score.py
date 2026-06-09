from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ScoreResponse(BaseModel):
    id: int
    user_id: int
    room_id: int
    puntos_total: int
    racha_actual: int

    class Config:
        from_attributes = True

class ScoreHistoryResponse(BaseModel):
    id: int
    user_id: int
    match_id: int
    puntos_ganados: int
    regla_aplicada: str
    descripcion: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ScoreHistoryPublicResponse(BaseModel):
    id: int
    user_id: int
    user_nombre: str
    match_id: int
    puntos_ganados: int
    regla_aplicada: str
    descripcion: Optional[str] = None
    created_at: datetime

class LeaderboardEntry(BaseModel):
    user_id: int
    nombre: str
    puntos_total: int
    racha_actual: int

    class Config:
        from_attributes = True