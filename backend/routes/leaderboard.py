from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import Score, User, RoomMember
from schemas.score import LeaderboardEntry
from typing import List

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get(
    "/global",
    response_model=List[LeaderboardEntry],
    summary="Ranking global",
    description="Retorna el ranking de todos los usuarios ordenado por puntos totales."
)
def global_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = (
        db.query(User.id, User.nombre, Score.puntos_total, Score.racha_actual)
        .join(Score, Score.user_id == User.id)
        .order_by(Score.puntos_total.desc())
        .all()
    )
    return [
        LeaderboardEntry(user_id=r[0], nombre=r[1], puntos_total=r[2], racha_actual=r[3])
        for r in results
    ]

@router.get(
    "/room/{room_id}",
    response_model=List[LeaderboardEntry],
    summary="Ranking de sala",
    description="Retorna el ranking de los miembros de una sala específica ordenado por puntos."
)
def room_leaderboard(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(RoomMember).filter(
        RoomMember.room_id == room_id,
        RoomMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No eres miembro de esta sala")

    results = (
        db.query(User.id, User.nombre, Score.puntos_total, Score.racha_actual)
        .join(Score, Score.user_id == User.id)
        .filter(Score.room_id == room_id)
        .order_by(Score.puntos_total.desc())
        .all()
    )
    return [
        LeaderboardEntry(user_id=r[0], nombre=r[1], puntos_total=r[2], racha_actual=r[3])
        for r in results
    ]