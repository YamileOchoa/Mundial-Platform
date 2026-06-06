from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.db import Base
import enum

# ── Enums ──────────────────────────────────────
class MatchStatus(str, enum.Enum):
    pendiente = "pendiente"
    en_curso = "en_curso"
    terminado = "terminado"

class SobreTipo(str, enum.Enum):
    bronce = "bronce"
    plata = "plata"
    oro = "oro"
    sorpresa = "sorpresa"

# ── Modelos ────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id               = Column(Integer, primary_key=True, index=True)
    nombre           = Column(String(100), nullable=False)
    email            = Column(String(150), unique=True, index=True, nullable=False)
    password_hash    = Column(String(255), nullable=False)
    foto_url         = Column(String(255), nullable=True)
    es_admin_global  = Column(Boolean, default=False)
    chat_uses_today  = Column(Integer, default=0)
    chat_reset_date  = Column(DateTime, nullable=True)
    created_at       = Column(DateTime, server_default=func.now())

    rooms_admin      = relationship("Room", back_populates="admin")
    memberships      = relationship("RoomMember", back_populates="user")
    predictions      = relationship("Prediction", back_populates="user")
    scores           = relationship("Score", back_populates="user")
    score_history    = relationship("ScoreHistory", back_populates="user")
    rewards          = relationship("Reward", back_populates="user")


class Room(Base):
    __tablename__ = "rooms"

    id                 = Column(Integer, primary_key=True, index=True)
    nombre             = Column(String(100), nullable=False)
    codigo_invitacion  = Column(String(20), unique=True, nullable=False)
    admin_id           = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at         = Column(DateTime, server_default=func.now())

    admin              = relationship("User", back_populates="rooms_admin")
    members            = relationship("RoomMember", back_populates="room")
    matches            = relationship("Match", back_populates="room")
    scores             = relationship("Score", back_populates="room")


class RoomMember(Base):
    __tablename__ = "room_members"

    id         = Column(Integer, primary_key=True, index=True)
    room_id    = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at  = Column(DateTime, server_default=func.now())

    room       = relationship("Room", back_populates="members")
    user       = relationship("User", back_populates="memberships")


class Match(Base):
    __tablename__ = "matches"

    id                   = Column(Integer, primary_key=True, index=True)
    equipo_local         = Column(String(100), nullable=False)
    equipo_visita        = Column(String(100), nullable=False)
    fecha_inicio         = Column(DateTime, nullable=False)
    goles_local          = Column(Integer, nullable=True)
    goles_visita         = Column(Integer, nullable=True)
    goleador_real        = Column(String(100), nullable=True)
    jugador_tarjeta_real = Column(String(100), nullable=True)
    tipo_tarjeta_real    = Column(String(20), nullable=True)
    minuto_primer_gol    = Column(Integer, nullable=True)
    estado               = Column(Enum(MatchStatus), default=MatchStatus.pendiente)
    room_id              = Column(Integer, ForeignKey("rooms.id"), nullable=False)

    room                 = relationship("Room", back_populates="matches")
    predictions          = relationship("Prediction", back_populates="match")
    score_history        = relationship("ScoreHistory", back_populates="match")


class Prediction(Base):
    __tablename__ = "predictions"

    id                   = Column(Integer, primary_key=True, index=True)
    user_id              = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_id             = Column(Integer, ForeignKey("matches.id"), nullable=False)
    goles_local_pred     = Column(Integer, nullable=False)
    goles_visita_pred    = Column(Integer, nullable=False)
    goleador_pred        = Column(String(100), nullable=True)
    jugador_tarjeta_pred = Column(String(100), nullable=True)
    tipo_tarjeta_pred    = Column(String(20), nullable=True)
    minuto_gol_pred      = Column(Integer, nullable=True)
    fecha_prediccion     = Column(DateTime, server_default=func.now())

    user                 = relationship("User", back_populates="predictions")
    match                = relationship("Match", back_populates="predictions")


class Score(Base):
    __tablename__ = "scores"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id          = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    puntos_total     = Column(Integer, default=0)
    racha_actual     = Column(Integer, default=0)

    user             = relationship("User", back_populates="scores")
    room             = relationship("Room", back_populates="scores")


class ScoreHistory(Base):
    __tablename__ = "score_history"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_id       = Column(Integer, ForeignKey("matches.id"), nullable=False)
    puntos_ganados = Column(Integer, nullable=False)
    regla_aplicada = Column(String(50), nullable=False)
    descripcion    = Column(Text, nullable=True)
    created_at     = Column(DateTime, server_default=func.now())

    user           = relationship("User", back_populates="score_history")
    match          = relationship("Match", back_populates="score_history")


class Reward(Base):
    __tablename__ = "rewards"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    tipo_sobre     = Column(Enum(SobreTipo), nullable=False)
    fecha_obtenida = Column(DateTime, server_default=func.now())
    pdf_url        = Column(String(255), nullable=True)

    user           = relationship("User", back_populates="rewards")


class Player(Base):
    __tablename__ = "players"

    id       = Column(Integer, primary_key=True, index=True)
    nombre   = Column(String(100), nullable=False)
    pais     = Column(String(100), nullable=False)
    posicion = Column(String(50), nullable=False)
    foto_url = Column(String(255), nullable=True)