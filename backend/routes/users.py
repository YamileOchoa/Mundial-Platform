from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import User, Score, ScoreHistory, Prediction
from schemas.user import UserResponse, UserUpdate, UserStats

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Ver mi perfil",
    description="Retorna los datos del usuario autenticado."
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put(
    "/me",
    response_model=UserResponse,
    summary="Actualizar mi perfil",
    description="Permite actualizar el nombre y foto de perfil del usuario autenticado."
)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.nombre:
        current_user.nombre = data.nombre
    if data.foto_url:
        current_user.foto_url = data.foto_url
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get(
    "/me/stats",
    response_model=UserStats,
    summary="Mis estadísticas",
    description="Retorna estadísticas calculadas del usuario: predicciones, aciertos, puntos y racha."
)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = (
        db.query(func.count(Prediction.id))
        .filter(Prediction.user_id == current_user.id)
        .scalar() or 0
    )

    correctos = (
        db.query(func.count(func.distinct(ScoreHistory.match_id)))
        .filter(
            ScoreHistory.user_id == current_user.id,
            ScoreHistory.regla_aplicada.in_(["ganador_correcto", "resultado_exacto"])
        )
        .scalar() or 0
    )

    scores = db.query(Score).filter(Score.user_id == current_user.id).all()
    puntos_totales = sum(s.puntos_total for s in scores)
    racha = max((s.racha_actual for s in scores), default=0)

    return UserStats(
        total_predicciones=total,
        partidos_ganador_correcto=correctos,
        puntos_totales=puntos_totales,
        racha_maxima_actual=racha,
    )
