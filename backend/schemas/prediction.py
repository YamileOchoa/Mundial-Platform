from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PredictionCreate(BaseModel):
    match_id: int
    goles_local_pred: int
    goles_visita_pred: int
    goleador_pred: Optional[str] = None
    jugador_tarjeta_pred: Optional[str] = None
    tipo_tarjeta_pred: Optional[str] = None
    minuto_gol_pred: Optional[int] = None

class PredictionResponse(BaseModel):
    id: int
    user_id: int
    match_id: int
    goles_local_pred: int
    goles_visita_pred: int
    goleador_pred: Optional[str] = None
    jugador_tarjeta_pred: Optional[str] = None
    tipo_tarjeta_pred: Optional[str] = None
    minuto_gol_pred: Optional[int] = None
    fecha_prediccion: datetime

    class Config:
        from_attributes = True