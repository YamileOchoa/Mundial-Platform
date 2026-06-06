from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config.db import engine
from models.models import Base
from config.auth import get_current_admin
import os

Base.metadata.create_all(bind=engine)

# ── Rutas públicas ──────────────────────────────
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.rooms import router as rooms_router
from routes.matches import router as matches_router
from routes.predictions import router as predictions_router
from routes.leaderboard import router as leaderboard_router
from routes.rewards import router as rewards_router
from routes.chat import router as chat_router

# ── Rutas admin ─────────────────────────────────
from routes.admin.admin_matches import router as admin_matches_router
from routes.admin.admin_users import router as admin_users_router
from routes.admin.admin_rooms import router as admin_rooms_router

# Use venv: python -m venv venv
# Activate venv: .\venv\Scripts\activate
# Install dependencies: pip install -r requirements.txt
# Run API: uvicorn main:app --reload
# Swagger UI: http://127.0.0.1:8000/docs
# ReDoc:      http://127.0.0.1:8000/redoc

app = FastAPI(
    title="Mundialito API",
    description="API para predicciones del Mundial de Fútbol. Crea salas, predice resultados y acumula puntos con tus amigos.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ── CORS ────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# ── Rutas públicas ──────────────────────────────
app.include_router(auth_router,         prefix="/api")
app.include_router(users_router,        prefix="/api")
app.include_router(rooms_router,        prefix="/api")
app.include_router(matches_router,      prefix="/api")
app.include_router(predictions_router,  prefix="/api")
app.include_router(leaderboard_router,  prefix="/api")
app.include_router(rewards_router,      prefix="/api")
app.include_router(chat_router,         prefix="/api")

# ── Rutas admin (protegidas) ────────────────────
app.include_router(admin_matches_router, prefix="/api/admin", dependencies=[Depends(get_current_admin)])
app.include_router(admin_users_router,   prefix="/api/admin", dependencies=[Depends(get_current_admin)])
app.include_router(admin_rooms_router,   prefix="/api/admin", dependencies=[Depends(get_current_admin)])

# ── Archivos estáticos (PDFs de sobres) ─────────
MEDIA_DIR = os.getenv("MEDIA_DIR", "media")
os.makedirs(MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")