from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.security import hash_password, verify_password
from config.auth import create_access_token
from models.models import User
from schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post(
    "/register",
    response_model=UserResponse,
    summary="Registrar nuevo usuario",
    description="Crea una cuenta nueva con nombre, email y contraseña."
)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    user = User(
        nombre=data.nombre,
        email=data.email,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Iniciar sesión",
    description="Retorna un JWT token para usar en los endpoints protegidos. Incluirlo en el header: Authorization: Bearer {token}"
)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}