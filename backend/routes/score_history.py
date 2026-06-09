from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import ScoreHistory, Match, RoomMember, User, MatchStatus
from schemas.score import ScoreHistoryResponse, ScoreHistoryPublicResponse
from typing import List, Optional

router = APIRouter(prefix="/score-history", tags=["Historial de Puntos"])

@router.get(
    "/my",
    response_model=List[ScoreHistoryResponse],
    summary="Mi historial de puntos",
    description="Retorna el historial de puntos del usuario autenticado. Usar ?match_id= para filtrar por partido."
)
def get_my_score_history(
    match_id: Optional[int] = Query(None, description="Filtrar por partido específico"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ScoreHistory).filter(ScoreHistory.user_id == current_user.id)
    if match_id is not None:
        query = query.filter(ScoreHistory.match_id == match_id)
    return query.order_by(ScoreHistory.created_at.desc()).all()

@router.get(
    "/",
    response_model=List[ScoreHistoryPublicResponse],
    summary="Historial de puntos de un partido",
    description="Retorna el desglose de puntos de todos los usuarios para un partido. Solo disponible cuando el partido está terminado."
)
def get_match_score_history(
    match_id: int = Query(..., description="ID del partido"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partido no encontrado")

    if match.estado != MatchStatus.terminado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El historial de puntos solo está disponible cuando el partido termina"
        )

    member = db.query(RoomMember).filter(
        RoomMember.room_id == match.room_id,
        RoomMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No eres miembro de la sala de este partido")

    rows = (
        db.query(ScoreHistory, User)
        .join(User, User.id == ScoreHistory.user_id)
        .filter(ScoreHistory.match_id == match_id)
        .order_by(ScoreHistory.user_id, ScoreHistory.created_at)
        .all()
    )
    return [
        ScoreHistoryPublicResponse(
            id=sh.id,
            user_id=sh.user_id,
            user_nombre=u.nombre,
            match_id=sh.match_id,
            puntos_ganados=sh.puntos_ganados,
            regla_aplicada=sh.regla_aplicada,
            descripcion=sh.descripcion,
            created_at=sh.created_at,
        )
        for sh, u in rows
    ]
