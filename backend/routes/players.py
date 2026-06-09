from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import Player, User
from schemas.player import PlayerResponse
from typing import List, Optional

router = APIRouter(prefix="/players", tags=["Jugadores"])

@router.get(
    "/",
    response_model=List[PlayerResponse],
    summary="Buscar jugadores",
    description="Busca jugadores del catálogo por nombre o país. Útil para autocompletar en el formulario de predicción."
)
def search_players(
    q: Optional[str] = Query(None, description="Texto a buscar en el nombre del jugador"),
    pais: Optional[str] = Query(None, description="Filtrar por país (código o nombre)"),
    limit: int = Query(10, ge=1, le=50, description="Máximo de resultados"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Player)
    if q:
        query = query.filter(Player.nombre.ilike(f"%{q}%"))
    if pais:
        query = query.filter(Player.pais.ilike(f"%{pais}%"))
    return query.order_by(Player.nombre).limit(limit).all()
