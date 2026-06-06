from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import Prediction, Match, RoomMember, User, MatchStatus
from schemas.prediction import PredictionCreate, PredictionResponse
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/predictions", tags=["Predicciones"])

@router.post(
    "/",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear predicción",
    description="Registra la predicción de un usuario para un partido. No se permite predecir si faltan menos de 10 minutos para el partido."
)
def create_prediction(
    data: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).filter(Match.id == data.match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partido no encontrado")

    if match.estado != MatchStatus.pendiente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El partido ya no acepta predicciones")

    if datetime.utcnow() >= match.fecha_inicio - timedelta(minutes=10):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes predecir con menos de 10 minutos de anticipación")

    member = db.query(RoomMember).filter(
        RoomMember.room_id == match.room_id,
        RoomMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No eres miembro de la sala de este partido")

    existing = db.query(Prediction).filter(
        Prediction.match_id == data.match_id,
        Prediction.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya tienes una predicción para este partido")

    prediction = Prediction(
        user_id=current_user.id,
        match_id=data.match_id,
        goles_local_pred=data.goles_local_pred,
        goles_visita_pred=data.goles_visita_pred,
        goleador_pred=data.goleador_pred,
        jugador_tarjeta_pred=data.jugador_tarjeta_pred,
        tipo_tarjeta_pred=data.tipo_tarjeta_pred,
        minuto_gol_pred=data.minuto_gol_pred
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction

@router.get(
    "/my",
    response_model=List[PredictionResponse],
    summary="Mis predicciones",
    description="Retorna todas las predicciones del usuario autenticado."
)
def get_my_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Prediction).filter(Prediction.user_id == current_user.id).all()