import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from config.db import Base, get_db

# DB en memoria para tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def user_token(client):
    client.post("/api/auth/register", json={
        "nombre": "Test User",
        "email": "test@test.com",
        "password": "123456"
    })
    response = client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "123456"
    })
    return response.json()["access_token"]

@pytest.fixture
def admin_token(client):
    from sqlalchemy.orm import Session
    from models.models import User
    from config.security import hash_password

    db = TestingSessionLocal()
    admin = User(
        nombre="Admin",
        email="admin@test.com",
        password_hash=hash_password("123456"),
        es_admin_global=True
    )
    db.add(admin)
    db.commit()
    db.close()

    response = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "123456"
    })
    return response.json()["access_token"]

@pytest.fixture
def sample_room(client, user_token):
    response = client.post(
        "/api/rooms/",
        json={"nombre": "Sala Test"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    return response.json()

@pytest.fixture
def sample_match(client, user_token, sample_room):
    from datetime import datetime, timedelta
    fecha = (datetime.utcnow() + timedelta(days=2)).isoformat()
    response = client.post(
        "/api/matches/",
        json={
            "equipo_local": "Francia",
            "equipo_visita": "Argentina",
            "fecha_inicio": fecha,
            "room_id": sample_room["id"]
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    return response.json()