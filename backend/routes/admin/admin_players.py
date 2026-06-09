from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_admin
from models.models import Player, User
from schemas.player import PlayerCreate, PlayerResponse
from typing import List

router = APIRouter(prefix="/players", tags=["Admin - Jugadores"])

@router.post(
    "/",
    response_model=PlayerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear jugador",
    description="Agrega un jugador al catálogo."
)
def create_player(
    data: PlayerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    player = Player(**data.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player

@router.post(
    "/bulk",
    response_model=List[PlayerResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Importar jugadores en bloque",
    description="Agrega múltiples jugadores al catálogo en una sola petición. Útil para carga inicial."
)
def bulk_create_players(
    players: List[PlayerCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    objs = [Player(**p.model_dump()) for p in players]
    db.add_all(objs)
    db.commit()
    for obj in objs:
        db.refresh(obj)
    return objs

@router.delete(
    "/{player_id}",
    summary="Eliminar jugador",
    description="Elimina un jugador del catálogo."
)
def delete_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jugador no encontrado")
    db.delete(player)
    db.commit()
    return {"detail": "Jugador eliminado correctamente"}
