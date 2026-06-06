from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_admin
from models.models import Match, MatchStatus, User
from schemas.match import MatchResult, MatchResponse
from services.scoring import calculate_scores
from typing import List

router = APIRouter(prefix="/matches", tags=["Admin - Partidos"])

@router.put(
    "/{match_id}/result",
    response_model=MatchResponse,
    summary="Registrar resultado de partido",
    description="Solo el admin global puede registrar el resultado real de un partido. Al registrarlo se calculan automáticamente los puntos de todos los usuarios que predijeron."
)
def set_match_result(
    match_id: int,
    data: MatchResult,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partido no encontrado")
    if match.estado == MatchStatus.terminado:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El partido ya tiene resultado registrado")

    match.goles_local          = data.goles_local
    match.goles_visita         = data.goles_visita
    match.goleador_real        = data.goleador_real
    match.jugador_tarjeta_real = data.jugador_tarjeta_real
    match.tipo_tarjeta_real    = data.tipo_tarjeta_real
    match.minuto_primer_gol    = data.minuto_primer_gol
    match.estado               = MatchStatus.terminado
    db.commit()
    db.refresh(match)

    calculate_scores(match_id=match.id, db=db)

    return match

@router.get(
    "/",
    response_model=List[MatchResponse],
    summary="Ver todos los partidos",
    description="Lista todos los partidos de todas las salas."
)
def get_all_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return db.query(Match).all()