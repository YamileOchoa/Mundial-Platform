from datetime import datetime, timedelta
from services.scoring import (
    regla_resultado_exacto,
    regla_ganador_correcto,
    regla_diferencia_correcta,
    regla_prediccion_anticipada,
    regla_bonus_racha,
    regla_goleador,
    regla_tarjeta,
    regla_minuto_gol
)
from models.models import Prediction, Match, ScoreHistory, MatchStatus

def make_match(goles_local, goles_visita, fecha_inicio=None):
    m = Match()
    m.goles_local = goles_local
    m.goles_visita = goles_visita
    m.fecha_inicio = fecha_inicio or datetime.utcnow() + timedelta(days=2)
    m.goleador_real = None
    m.jugador_tarjeta_real = None
    m.tipo_tarjeta_real = None
    m.minuto_primer_gol = None
    return m

def make_pred(goles_local, goles_visita, fecha_pred=None):
    p = Prediction()
    p.goles_local_pred = goles_local
    p.goles_visita_pred = goles_visita
    p.fecha_prediccion = fecha_pred or datetime.utcnow()
    p.goleador_pred = None
    p.jugador_tarjeta_pred = None
    p.tipo_tarjeta_pred = None
    p.minuto_gol_pred = None
    return p

# ── Regla 1 ────────────────────────────────────

def test_regla1_resultado_exacto():
    pred  = make_pred(2, 1)
    match = make_match(2, 1)
    puntos, desc = regla_resultado_exacto(pred, match)
    assert puntos == 5
    assert "exacto" in desc.lower()

def test_regla1_no_aplica():
    pred  = make_pred(2, 1)
    match = make_match(3, 1)
    puntos, _ = regla_resultado_exacto(pred, match)
    assert puntos == 0

# ── Regla 2 ────────────────────────────────────

def test_regla2_ganador_correcto():
    pred  = make_pred(2, 1)
    match = make_match(3, 1)
    puntos, desc = regla_ganador_correcto(pred, match)
    assert puntos == 3
    assert "ganador" in desc.lower()

def test_regla2_no_suma_si_exacto():
    pred  = make_pred(2, 1)
    match = make_match(2, 1)
    puntos, _ = regla_ganador_correcto(pred, match)
    assert puntos == 0

# ── Regla 3 ────────────────────────────────────

def test_regla3_diferencia_correcta():
    pred  = make_pred(3, 1)  # diff = 2
    match = make_match(2, 0) # diff = 2
    puntos, desc = regla_diferencia_correcta(pred, match)
    assert puntos == 2
    assert "diferencia" in desc.lower()

def test_regla3_no_aplica_si_ganador_incorrecto():
    pred  = make_pred(1, 2)  # visita gana
    match = make_match(2, 0) # local gana
    puntos, _ = regla_diferencia_correcta(pred, match)
    assert puntos == 0

# ── Regla 4 ────────────────────────────────────

def test_regla4_bonus_racha(setup_db):
    from tests.conftest import TestingSessionLocal
    from models.models import ScoreHistory

    db = TestingSessionLocal()
    for _ in range(3):
        h = ScoreHistory(
            user_id=1,
            match_id=1,
            puntos_ganados=3,
            regla_aplicada="ganador_correcto",
            descripcion="test"
        )
        db.add(h)
    db.commit()

    puntos, desc = regla_bonus_racha(user_id=1, room_id=1, db=db)
    db.close()
    assert puntos == 2
    assert "racha" in desc.lower()

def test_regla4_sin_racha(setup_db):
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    for _ in range(2):
        h = ScoreHistory(
            user_id=1,
            match_id=1,
            puntos_ganados=3,
            regla_aplicada="ganador_correcto",
            descripcion="test"
        )
        db.add(h)
    db.commit()

    puntos, _ = regla_bonus_racha(user_id=1, room_id=1, db=db)
    db.close()
    assert puntos == 0

# ── Regla 5 ────────────────────────────────────

def test_regla5_anticipada_25h():
    fecha_inicio = datetime.utcnow() + timedelta(hours=26)
    pred  = make_pred(2, 1, fecha_pred=datetime.utcnow())
    match = make_match(2, 1, fecha_inicio=fecha_inicio)
    match.fecha_inicio = fecha_inicio
    puntos, desc = regla_prediccion_anticipada(pred, match)
    assert puntos == 1
    assert "anticipaci" in desc.lower()

def test_regla5_no_anticipada():
    fecha_inicio = datetime.utcnow() + timedelta(hours=12)
    pred  = make_pred(2, 1, fecha_pred=datetime.utcnow())
    match = make_match(2, 1, fecha_inicio=fecha_inicio)
    puntos, _ = regla_prediccion_anticipada(pred, match)
    assert puntos == 0

# ── Reglas especiales ──────────────────────────

def test_regla6_goleador_correcto():
    pred  = make_pred(2, 1)
    match = make_match(2, 1)
    pred.goleador_pred        = "Messi"
    match.goleador_real       = "Messi"
    puntos, desc = regla_goleador(pred, match)
    assert puntos == 3

def test_regla7_tarjeta_correcta():
    pred  = make_pred(2, 1)
    match = make_match(2, 1)
    pred.jugador_tarjeta_pred  = "Neymar"
    pred.tipo_tarjeta_pred     = "amarilla"
    match.jugador_tarjeta_real = "Neymar"
    match.tipo_tarjeta_real    = "amarilla"
    puntos, _ = regla_tarjeta(pred, match)
    assert puntos == 2

def test_regla8_minuto_gol_correcto():
    pred  = make_pred(2, 1)
    match = make_match(2, 1)
    pred.minuto_gol_pred    = 35
    match.minuto_primer_gol = 38
    puntos, _ = regla_minuto_gol(pred, match)
    assert puntos == 2

def test_regla8_minuto_gol_fuera_margen():
    pred  = make_pred(2, 1)
    match = make_match(2, 1)
    pred.minuto_gol_pred    = 35
    match.minuto_primer_gol = 50
    puntos, _ = regla_minuto_gol(pred, match)
    assert puntos == 0

def test_engine_suma_total():
    pred  = make_pred(2, 1, fecha_pred=datetime.utcnow() - timedelta(hours=25))
    match = make_match(2, 1, fecha_inicio=datetime.utcnow() + timedelta(hours=1))
    match.fecha_inicio = datetime.utcnow() + timedelta(hours=1)
    puntos_exacto, _     = regla_resultado_exacto(pred, match)
    puntos_anticipada, _ = regla_prediccion_anticipada(pred, match)
    assert puntos_exacto + puntos_anticipada == 6