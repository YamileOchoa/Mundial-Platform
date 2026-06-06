def test_crear_sala(client, user_token):
    response = client.post(
        "/api/rooms/",
        json={"nombre": "Mi Sala"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "codigo_invitacion" in data
    assert data["nombre"] == "Mi Sala"

def test_unirse_codigo_valido(client, user_token, sample_room):
    # registrar segundo usuario
    client.post("/api/auth/register", json={
        "nombre": "Usuario 2",
        "email": "user2@test.com",
        "password": "123456"
    })
    response2 = client.post("/api/auth/login", json={
        "email": "user2@test.com",
        "password": "123456"
    })
    token2 = response2.json()["access_token"]

    response = client.post(
        "/api/rooms/join",
        json={"codigo_invitacion": sample_room["codigo_invitacion"]},
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert response.status_code == 200

def test_unirse_codigo_invalido(client, user_token):
    response = client.post(
        "/api/rooms/join",
        json={"codigo_invitacion": "INVALIDO"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 404

def test_unirse_dos_veces(client, user_token, sample_room):
    response = client.post(
        "/api/rooms/join",
        json={"codigo_invitacion": sample_room["codigo_invitacion"]},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 400

def test_leaderboard_sala(client, user_token, sample_room):
    response = client.get(
        f"/api/leaderboard/room/{sample_room['id']}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)