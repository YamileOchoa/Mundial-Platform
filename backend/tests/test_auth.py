def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "nombre": "Usuario Test",
        "email": "nuevo@test.com",
        "password": "123456"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "nuevo@test.com"
    assert data["nombre"] == "Usuario Test"

def test_register_email_duplicado(client):
    client.post("/api/auth/register", json={
        "nombre": "Usuario Test",
        "email": "duplicado@test.com",
        "password": "123456"
    })
    response = client.post("/api/auth/register", json={
        "nombre": "Usuario Test 2",
        "email": "duplicado@test.com",
        "password": "123456"
    })
    assert response.status_code == 400

def test_login_success(client):
    client.post("/api/auth/register", json={
        "nombre": "Usuario Test",
        "email": "login@test.com",
        "password": "123456"
    })
    response = client.post("/api/auth/login", json={
        "email": "login@test.com",
        "password": "123456"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_password_incorrecta(client):
    client.post("/api/auth/register", json={
        "nombre": "Usuario Test",
        "email": "pass@test.com",
        "password": "123456"
    })
    response = client.post("/api/auth/login", json={
        "email": "pass@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_login_email_inexistente(client):
    response = client.post("/api/auth/login", json={
        "email": "noexiste@test.com",
        "password": "123456"
    })
    assert response.status_code == 401

def test_me_sin_token(client):
    response = client.get("/api/users/me")
    assert response.status_code == 401