from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_admin
from models.models import User, Score
from schemas.user import UserResponse
from typing import List

router = APIRouter(prefix="/users", tags=["Admin - Usuarios"])

@router.get(
    "/",
    response_model=List[UserResponse],
    summary="Ver todos los usuarios",
    description="Lista todos los usuarios registrados en el sistema."
)
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return db.query(User).all()

@router.put(
    "/{user_id}/make-admin",
    response_model=UserResponse,
    summary="Promover a admin global",
    description="Convierte a un usuario normal en administrador global del sistema."
)
def make_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    user.es_admin_global = True
    db.commit()
    db.refresh(user)
    return user

@router.delete(
    "/{user_id}",
    summary="Eliminar usuario",
    description="Elimina un usuario y todas sus predicciones del sistema."
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return {"detail": "Usuario eliminado correctamente"}