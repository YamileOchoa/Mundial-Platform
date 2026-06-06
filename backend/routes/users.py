from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import User
from schemas.user import UserResponse, UserUpdate

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