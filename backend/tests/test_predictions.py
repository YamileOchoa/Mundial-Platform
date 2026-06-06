from datetime import datetime, timedelta

def test_crear_prediccion_valida(client, user_token, sample_match):
    response = client.post(
        "/api/predictions/",
        json={
            "match_id": sample_match["id"],
            "goles_local_pred": 2,
            "goles_visita_pred": 1
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 201

def test_crear_prediccion_10min_antes(client, user_token, sample_room):
    fecha = (datetime.utcnow() + timedelta(minutes=5)).isoformat()
    match_response = client.post(
        "/api/matches/",
        json={
            "equipo_local": "Brasil",
            "equipo_visita": "Alemania",
            "fecha_inicio": fecha,
            "room_id": sample_room["id"]
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    match = match_response.json()
    response = client.post(
        "/api/predictions/",
        json={
            "match_id": match["id"],
            "goles_local_pred": 1,
            "goles_visita_pred": 0
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 400

def test_ver_mis_predicciones(client, user_token, sample_match):
    client.post(
        "/api/predictions/",
        json={
            "match_id": sample_match["id"],
            "goles_local_pred": 2,
            "goles_visita_pred": 1
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    response = client.get(
        "/api/predictions/my",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_prediccion_sin_ser_miembro(client, sample_match):
    client.post("/api/auth/register", json={
        "nombre": "Intruso",
        "email": "intruso@test.com",
        "password": "123456"
    })
    response = client.post("/api/auth/login", json={
        "email": "intruso@test.com",
        "password": "123456"
    })
    token_intruso = response.json()["access_token"]

    response = client.post(
        "/api/predictions/",
        json={
            "match_id": sample_match["id"],
            "goles_local_pred": 1,
            "goles_visita_pred": 0
        },
        headers={"Authorization": f"Bearer {token_intruso}"}
    )
    assert response.status_code == 403

def test_prediccion_duplicada(client, user_token, sample_match):
    client.post(
        "/api/predictions/",
        json={
            "match_id": sample_match["id"],
            "goles_local_pred": 2,
            "goles_visita_pred": 1
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    response = client.post(
        "/api/predictions/",
        json={
            "match_id": sample_match["id"],
            "goles_local_pred": 3,
            "goles_visita_pred": 0
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 400