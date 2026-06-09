from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import Prediction, Match, RoomMember, User, MatchStatus
from schemas.prediction import PredictionCreate, PredictionUpdate, PredictionResponse, PredictionPublicResponse
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya tienes una predicción para este partido. Usa PUT /predictions/{id} para editarla.")

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

@router.put(
    "/{prediction_id}",
    response_model=PredictionResponse,
    summary="Editar predicción",
    description="Modifica una predicción existente. Solo es posible mientras el partido esté pendiente y falten más de 10 minutos."
)
def update_prediction(
    prediction_id: int,
    data: PredictionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pred = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    ).first()
    if not pred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Predicción no encontrada")

    match = db.query(Match).filter(Match.id == pred.match_id).first()
    if match.estado != MatchStatus.pendiente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El partido ya no acepta cambios en predicciones")

    if datetime.utcnow() >= match.fecha_inicio - timedelta(minutes=10):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes editar con menos de 10 minutos de anticipación")

    if data.goles_local_pred is not None:
        pred.goles_local_pred = data.goles_local_pred
    if data.goles_visita_pred is not None:
        pred.goles_visita_pred = data.goles_visita_pred
    if data.goleador_pred is not None:
        pred.goleador_pred = data.goleador_pred
    if data.jugador_tarjeta_pred is not None:
        pred.jugador_tarjeta_pred = data.jugador_tarjeta_pred
    if data.tipo_tarjeta_pred is not None:
        pred.tipo_tarjeta_pred = data.tipo_tarjeta_pred
    if data.minuto_gol_pred is not None:
        pred.minuto_gol_pred = data.minuto_gol_pred

    db.commit()
    db.refresh(pred)
    return pred

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

@router.get(
    "/",
    response_model=List[PredictionPublicResponse],
    summary="Predicciones de un partido",
    description="Retorna las predicciones de todos los miembros para un partido. Solo disponible cuando el partido está terminado."
)
def get_predictions_by_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partido no encontrado")

    member = db.query(RoomMember).filter(
        RoomMember.room_id == match.room_id,
        RoomMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No eres miembro de la sala de este partido")

    if match.estado != MatchStatus.terminado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las predicciones de otros usuarios solo son visibles cuando el partido termina"
        )

    rows = (
        db.query(Prediction, User)
        .join(User, User.id == Prediction.user_id)
        .filter(Prediction.match_id == match_id)
        .all()
    )
    return [
        PredictionPublicResponse(
            id=p.id,
            user_id=p.user_id,
            user_nombre=u.nombre,
            match_id=p.match_id,
            goles_local_pred=p.goles_local_pred,
            goles_visita_pred=p.goles_visita_pred,
            goleador_pred=p.goleador_pred,
            jugador_tarjeta_pred=p.jugador_tarjeta_pred,
            tipo_tarjeta_pred=p.tipo_tarjeta_pred,
            minuto_gol_pred=p.minuto_gol_pred,
            fecha_prediccion=p.fecha_prediccion,
        )
        for p, u in rows
    ]
