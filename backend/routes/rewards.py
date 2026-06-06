from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import Reward, User
from typing import List
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/rewards", tags=["Recompensas"])

class RewardResponse(BaseModel):
    id: int
    user_id: int
    tipo_sobre: str
    fecha_obtenida: datetime
    pdf_url: Optional[str] = None

    class Config:
        from_attributes = True

@router.get(
    "/my",
    response_model=List[RewardResponse],
    summary="Mis recompensas",
    description="Retorna todos los sobres de cromos ganados por el usuario autenticado."
)
def get_my_rewards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Reward).filter(Reward.user_id == current_user.id).all()

@router.get(
    "/{reward_id}/pdf",
    summary="Descargar sobre PDF",
    description="Retorna la URL de descarga del PDF del sobre de cromos."
)
def get_reward_pdf(
    reward_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reward = db.query(Reward).filter(
        Reward.id == reward_id,
        Reward.user_id == current_user.id
    ).first()
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recompensa no encontrada")
    if not reward.pdf_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El PDF aún no fue generado")
    return {"pdf_url": reward.pdf_url}