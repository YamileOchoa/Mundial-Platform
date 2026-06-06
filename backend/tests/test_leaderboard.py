def test_leaderboard_global(client, user_token):
    response = client.get(
        "/api/leaderboard/global",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_leaderboard_sala_vacia(client, user_token, sample_room):
    response = client.get(
        f"/api/leaderboard/room/{sample_room['id']}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    assert response.json() == []

def test_leaderboard_ordenamiento(client, user_token, sample_room):
    from models.models import Score
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    # registrar 2 usuarios mas
    for i, pts in enumerate([10, 20]):
        client.post("/api/auth/register", json={
            "nombre": f"User {i}",
            "email": f"user{i}@orden.com",
            "password": "123456"
        })
        from models.models import User
        u = db.query(User).filter(User.email == f"user{i}@orden.com").first()
        score = Score(user_id=u.id, room_id=sample_room["id"], puntos_total=pts)
        db.add(score)
    db.commit()
    db.close()

    response = client.get(
        f"/api/leaderboard/room/{sample_room['id']}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    data = response.json()
    assert data[0]["puntos_total"] >= data[-1]["puntos_total"]