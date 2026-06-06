from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import Match, Room, RoomMember, User, MatchStatus
from schemas.match import MatchCreate, MatchResponse
from typing import List

router = APIRouter(prefix="/matches", tags=["Partidos"])

@router.post(
    "/",
    response_model=MatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear partido",
    description="Solo el admin de la sala puede agregar partidos. Los miembros podrán predecir el resultado."
)
def create_match(
    data: MatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sala no encontrada")
    if room.admin_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el admin de la sala puede agregar partidos")

    match = Match(
        equipo_local=data.equipo_local,
        equipo_visita=data.equipo_visita,
        fecha_inicio=data.fecha_inicio,
        room_id=data.room_id
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match

@router.get(
    "/",
    response_model=List[MatchResponse],
    summary="Ver partidos",
    description="Lista los partidos de una sala. Usar ?room_id= para filtrar por sala."
)
def get_matches(
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

    return db.query(Match).filter(Match.room_id == room_id).all()