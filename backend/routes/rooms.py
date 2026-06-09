from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import Room, RoomMember, User
from schemas.room import RoomCreate, RoomJoin, RoomResponse, MemberResponse
from typing import List
import uuid

router = APIRouter(prefix="/rooms", tags=["Salas"])

def generate_code() -> str:
    return "PRED-" + str(uuid.uuid4())[:6].upper()

@router.post(
    "/",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear sala",
    description="Crea una sala nueva. El usuario que la crea se convierte en admin de la sala y recibe un código único para invitar amigos."
)
def create_room(
    data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    code = generate_code()
    while db.query(Room).filter(Room.codigo_invitacion == code).first():
        code = generate_code()

    room = Room(nombre=data.nombre, codigo_invitacion=code, admin_id=current_user.id)
    db.add(room)
    db.flush()

    member = RoomMember(room_id=room.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    db.refresh(room)
    return room

@router.post(
    "/join",
    response_model=RoomResponse,
    summary="Unirse a sala",
    description="Permite unirse a una sala existente usando el código de invitación."
)
def join_room(
    data: RoomJoin,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.codigo_invitacion == data.codigo_invitacion).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Código de invitación inválido")

    already = db.query(RoomMember).filter(
        RoomMember.room_id == room.id,
        RoomMember.user_id == current_user.id
    ).first()
    if already:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya eres miembro de esta sala")

    member = RoomMember(room_id=room.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    return room

@router.get(
    "/",
    response_model=List[RoomResponse],
    summary="Mis salas",
    description="Retorna todas las salas a las que pertenece el usuario autenticado."
)
def get_my_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = db.query(RoomMember).filter(RoomMember.user_id == current_user.id).all()
    room_ids = [m.room_id for m in memberships]
    return db.query(Room).filter(Room.id.in_(room_ids)).all()

@router.get(
    "/{room_id}",
    response_model=RoomResponse,
    summary="Ver sala",
    description="Retorna el detalle de una sala. Solo accesible para miembros de la sala."
)
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sala no encontrada")

    member = db.query(RoomMember).filter(
        RoomMember.room_id == room_id,
        RoomMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No eres miembro de esta sala")

    return room

@router.get(
    "/{room_id}/members",
    response_model=List[MemberResponse],
    summary="Listar miembros de sala",
    description="Retorna los miembros de una sala. Solo accesible para miembros."
)
def get_room_members(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sala no encontrada")

    member = db.query(RoomMember).filter(
        RoomMember.room_id == room_id,
        RoomMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No eres miembro de esta sala")

    rows = (
        db.query(RoomMember, User)
        .join(User, User.id == RoomMember.user_id)
        .filter(RoomMember.room_id == room_id)
        .all()
    )
    return [
        MemberResponse(
            user_id=u.id,
            nombre=u.nombre,
            foto_url=u.foto_url,
            es_admin=(u.id == room.admin_id),
            joined_at=rm.joined_at,
        )
        for rm, u in rows
    ]

@router.post(
    "/{room_id}/leave",
    summary="Salir de sala",
    description="El usuario abandona la sala. El admin de la sala no puede salir (debe eliminar la sala)."
)
def leave_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sala no encontrada")

    if room.admin_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El admin de la sala no puede salir. Elimina la sala si ya no la necesitas."
        )

    member = db.query(RoomMember).filter(
        RoomMember.room_id == room_id,
        RoomMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No eres miembro de esta sala")

    db.delete(member)
    db.commit()
    return {"detail": "Saliste de la sala correctamente"}