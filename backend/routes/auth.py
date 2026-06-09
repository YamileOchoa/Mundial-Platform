from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from config.db import get_db
from config.security import hash_password, verify_password
from config.auth import create_access_token, create_refresh_token, SECRET_KEY, ALGORITHM
from models.models import User
from schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse, RefreshRequest

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
    description="Retorna un access token (JWT) y un refresh token. Incluir el access token en el header: Authorization: Bearer {token}"
)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    return {
        "access_token":  create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type":    "bearer",
    }

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Renovar tokens",
    description="Usa el refresh token para obtener un nuevo par de tokens sin volver a loguearse."
)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de refresco inválido o expirado"
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return {
        "access_token":  create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type":    "bearer",
    }
