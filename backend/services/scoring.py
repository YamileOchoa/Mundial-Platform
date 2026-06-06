from sqlalchemy.orm import Session
from models.models import Prediction, Match, Score, ScoreHistory, Reward, SobreTipo
from datetime import datetime, timedelta
from typing import Tuple

# ── Helpers ────────────────────────────────────

def get_winner(goles_local: int, goles_visita: int) -> str:
    if goles_local > goles_visita:
        return "local"
    elif goles_visita > goles_local:
        return "visita"
    return "empate"

# ── Reglas base ────────────────────────────────

def regla_resultado_exacto(pred: Prediction, match: Match) -> Tuple[int, str]:
    if pred.goles_local_pred == match.goles_local and pred.goles_visita_pred == match.goles_visita:
        return 5, "Resultado exacto acertado"
    return 0, ""

def regla_ganador_correcto(pred: Prediction, match: Match) -> Tuple[int, str]:
    if pred.goles_local_pred == match.goles_local and pred.goles_visita_pred == match.goles_visita:
        return 0, ""  # ya ganó por resultado exacto
    winner_pred   = get_winner(pred.goles_local_pred, pred.goles_visita_pred)
    winner_real   = get_winner(match.goles_local, match.goles_visita)
    if winner_pred == winner_real:
        return 3, "Ganador correcto acertado"
    return 0, ""

def regla_diferencia_correcta(pred: Prediction, match: Match) -> Tuple[int, str]:
    winner_pred = get_winner(pred.goles_local_pred, pred.goles_visita_pred)
    winner_real = get_winner(match.goles_local, match.goles_visita)
    if winner_pred != winner_real:
        return 0, ""  # ganador incorrecto, no aplica
    diff_pred = pred.goles_local_pred - pred.goles_visita_pred
    diff_real = match.goles_local - match.goles_visita
    exact     = pred.goles_local_pred == match.goles_local and pred.goles_visita_pred == match.goles_visita
    if not exact and diff_pred == diff_real:
        return 2, "Diferencia de goles correcta"
    return 0, ""

def regla_prediccion_anticipada(pred: Prediction, match: Match) -> Tuple[int, str]:
    anticipacion = match.fecha_inicio - pred.fecha_prediccion
    if anticipacion >= timedelta(hours=24):
        return 1, "Predicción registrada con más de 24h de anticipación"
    return 0, ""

def regla_bonus_racha(user_id: int, room_id: int, db: Session) -> Tuple[int, str]:
    historial = (
        db.query(ScoreHistory)
        .filter(
            ScoreHistory.user_id == user_id,
            ScoreHistory.regla_aplicada == "ganador_correcto"
        )
        .order_by(ScoreHistory.created_at.desc())
        .limit(3)
        .all()
    )
    if len(historial) == 3:
        return 2, "Bonus por racha de 3 partidos consecutivos acertados"
    return 0, ""

# ── Reglas especiales ──────────────────────────

def regla_goleador(pred: Prediction, match: Match) -> Tuple[int, str]:
    if pred.goleador_pred and match.goleador_real:
        if pred.goleador_pred.strip().lower() == match.goleador_real.strip().lower():
            return 3, f"Goleador correcto: {match.goleador_real}"
    return 0, ""

def regla_tarjeta(pred: Prediction, match: Match) -> Tuple[int, str]:
    if pred.jugador_tarjeta_pred and match.jugador_tarjeta_real:
        jugador_ok = pred.jugador_tarjeta_pred.strip().lower() == match.jugador_tarjeta_real.strip().lower()
        tarjeta_ok = pred.tipo_tarjeta_pred == match.tipo_tarjeta_real
        if jugador_ok and tarjeta_ok:
            return 2, f"Tarjeta correcta: {match.jugador_tarjeta_real} ({match.tipo_tarjeta_real})"
    return 0, ""

def regla_minuto_gol(pred: Prediction, match: Match) -> Tuple[int, str]:
    if pred.minuto_gol_pred is not None and match.minuto_primer_gol is not None:
        if abs(pred.minuto_gol_pred - match.minuto_primer_gol) <= 5:
            return 2, f"Minuto del primer gol acertado (±5 min): minuto {match.minuto_primer_gol}"
    return 0, ""

# ── Engine principal ───────────────────────────

def calculate_scores(match_id: int, db: Session):
    match       = db.query(Match).filter(Match.id == match_id).first()
    predictions = db.query(Prediction).filter(Prediction.match_id == match_id).all()

    for pred in predictions:
        puntos_totales = 0

        reglas = [
            ("resultado_exacto",    regla_resultado_exacto(pred, match)),
            ("ganador_correcto",    regla_ganador_correcto(pred, match)),
            ("diferencia_correcta", regla_diferencia_correcta(pred, match)),
            ("prediccion_anticipada", regla_prediccion_anticipada(pred, match)),
            ("goleador_correcto",   regla_goleador(pred, match)),
            ("tarjeta_correcta",    regla_tarjeta(pred, match)),
            ("minuto_gol",          regla_minuto_gol(pred, match)),
        ]

        for nombre_regla, (puntos, descripcion) in reglas:
            if puntos > 0:
                historial = ScoreHistory(
                    user_id        = pred.user_id,
                    match_id       = match_id,
                    puntos_ganados = puntos,
                    regla_aplicada = nombre_regla,
                    descripcion    = descripcion
                )
                db.add(historial)
                puntos_totales += puntos

        # bonus racha (necesita historial ya guardado de partidos anteriores)
        puntos_racha, desc_racha = regla_bonus_racha(pred.user_id, match.room_id, db)
        if puntos_racha > 0:
            db.add(ScoreHistory(
                user_id        = pred.user_id,
                match_id       = match_id,
                puntos_ganados = puntos_racha,
                regla_aplicada = "bonus_racha",
                descripcion    = desc_racha
            ))
            puntos_totales += puntos_racha

        # actualizar score
        score = db.query(Score).filter(
            Score.user_id == pred.user_id,
            Score.room_id == match.room_id
        ).first()

        if not score:
            score = Score(user_id=pred.user_id, room_id=match.room_id, puntos_total=0, racha_actual=0)
            db.add(score)
            db.flush()

        score.puntos_total += puntos_totales

        # actualizar racha
        winner_pred = get_winner(pred.goles_local_pred, pred.goles_visita_pred)
        winner_real = get_winner(match.goles_local, match.goles_visita)
        if winner_pred == winner_real:
            score.racha_actual += 1
        else:
            score.racha_actual = 0

        db.commit()

        # verificar recompensas
        _check_rewards(pred.user_id, score.puntos_total, score.racha_actual, db)

# ── Recompensas ────────────────────────────────

def _check_rewards(user_id: int, puntos_total: int, racha: int, db: Session):
    existing_tipos = {r.tipo_sobre for r in db.query(Reward).filter(Reward.user_id == user_id).all()}

    nuevos = []
    if puntos_total >= 200 and SobreTipo.oro not in existing_tipos:
        nuevos.append(SobreTipo.oro)
    if puntos_total >= 100 and SobreTipo.plata not in existing_tipos:
        nuevos.append(SobreTipo.plata)
    if puntos_total >= 50 and SobreTipo.bronce not in existing_tipos:
        nuevos.append(SobreTipo.bronce)
    if racha >= 5 and SobreTipo.sorpresa not in existing_tipos:
        nuevos.append(SobreTipo.sorpresa)

    for tipo in nuevos:
        reward = Reward(user_id=user_id, tipo_sobre=tipo)
        db.add(reward)

    if nuevos:
        db.commit()