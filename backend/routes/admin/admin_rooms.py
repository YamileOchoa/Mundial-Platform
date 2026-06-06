from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_admin
from models.models import Room, User
from schemas.room import RoomResponse
from typing import List

router = APIRouter(prefix="/rooms", tags=["Admin - Salas"])

@router.get(
    "/",
    response_model=List[RoomResponse],
    summary="Ver todas las salas",
    description="Lista todas las salas del sistema con sus datos."
)
def get_all_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return db.query(Room).all()

@router.delete(
    "/{room_id}",
    summary="Eliminar sala",
    description="Elimina una sala y todos sus datos asociados."
)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sala no encontrada")
    db.delete(room)
    db.commit()
    return {"detail": "Sala eliminada correctamente"}