from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from models.models import MatchStatus

class MatchCreate(BaseModel):
    equipo_local: str
    equipo_visita: str
    fecha_inicio: datetime
    room_id: int

class MatchResult(BaseModel):
    goles_local: int
    goles_visita: int
    goleador_real: Optional[str] = None
    jugador_tarjeta_real: Optional[str] = None
    tipo_tarjeta_real: Optional[str] = None
    minuto_primer_gol: Optional[int] = None

class MatchStatusUpdate(BaseModel):
    estado: MatchStatus

class MatchResponse(BaseModel):
    id: int
    equipo_local: str
    equipo_visita: str
    fecha_inicio: datetime
    goles_local: Optional[int] = None
    goles_visita: Optional[int] = None
    goleador_real: Optional[str] = None
    jugador_tarjeta_real: Optional[str] = None
    tipo_tarjeta_real: Optional[str] = None
    minuto_primer_gol: Optional[int] = None
    estado: MatchStatus
    room_id: int

    class Config:
        from_attributes = True