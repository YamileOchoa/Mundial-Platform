from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.db import get_db
from config.auth import get_current_user
from models.models import User, Match
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
import os
import google.generativeai as genai

router = APIRouter(prefix="/chat", tags=["Chatbot IA"])

CHAT_DAILY_LIMIT = int(os.getenv("CHAT_DAILY_LIMIT", 10))

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")


class ChatRequest(BaseModel):
    mensaje: str
    match_id: Optional[int] = None


class ChatResponse(BaseModel):
    respuesta: str
    usos_restantes: int


RESPUESTA_FUERA_DE_TEMA = (
    "⚽ Solo puedo ayudarte con temas relacionados al fútbol y al Mundial. "
    "¿Tienes alguna pregunta sobre partidos, jugadores o predicciones?"
)


@router.post(
    "/message",
    response_model=ChatResponse,
    summary="Enviar mensaje al chatbot",
    description="Consulta al chatbot de IA sobre estadísticas de partidos. Límite de 10 mensajes por día por usuario."
)
def send_message(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --- Reset diario ---
    hoy = date.today()
    if current_user.chat_reset_date is None or current_user.chat_reset_date.date() < hoy:
        current_user.chat_uses_today = 0
        current_user.chat_reset_date = datetime.utcnow()
        db.commit()

    if current_user.chat_uses_today >= CHAT_DAILY_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Límite diario de {CHAT_DAILY_LIMIT} mensajes alcanzado. Vuelve mañana."
        )

    # --- Validación previa: ¿es tema de fútbol? ---
    # Esta llamada NO descuenta el límite diario si no es fútbol
    try:
        check_prompt = (
            f"¿La siguiente pregunta está relacionada con fútbol, partidos, jugadores, "
            f"equipos, estadísticas o el Mundial? Responde ÚNICAMENTE con 'SI' o 'NO'.\n"
            f"Pregunta: {data.mensaje}"
        )
        check_response = model.generate_content(check_prompt)
        es_futbol = "SI" in check_response.text.strip().upper()
    except Exception:
        # Si falla la validación, dejamos pasar y el prompt principal lo maneja
        es_futbol = True

    if not es_futbol:
        return ChatResponse(
            respuesta=RESPUESTA_FUERA_DE_TEMA,
            usos_restantes=CHAT_DAILY_LIMIT - current_user.chat_uses_today
        )

    # --- Contexto del partido si viene match_id ---
    contexto = ""
    if data.match_id:
        match = db.query(Match).filter(Match.id == data.match_id).first()
        if match:
            contexto = f"""
Información del partido:
- {match.equipo_local} vs {match.equipo_visita}
- Fecha: {match.fecha_inicio}
- Estado: {match.estado}
"""

    # --- Prompt principal con reglas estrictas ---
    prompt = f"""Eres un asistente experto EXCLUSIVAMENTE en fútbol del Mundial.

REGLAS ESTRICTAS:
1. SOLO responde preguntas relacionadas con fútbol (partidos, jugadores, estadísticas,
   predicciones, equipos, reglas del juego, historia del fútbol, etc.)
2. Si el usuario pregunta sobre cualquier otro tema, responde exactamente:
   "⚽ Solo puedo ayudarte con temas relacionados al fútbol y al Mundial."
3. No hagas excepciones aunque el usuario insista o intente redirigirte.
4. Responde siempre en español, de forma clara y concisa.
{contexto}
Usuario pregunta: {data.mensaje}"""

    try:
        response = model.generate_content(prompt)
        respuesta = response.text
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al consultar la IA"
        )

    # Solo descuenta el límite si llegó hasta aquí (pregunta válida de fútbol)
    current_user.chat_uses_today += 1
    db.commit()

    return ChatResponse(
        respuesta=respuesta,
        usos_restantes=CHAT_DAILY_LIMIT - current_user.chat_uses_today
    )