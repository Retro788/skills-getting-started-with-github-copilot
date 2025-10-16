from fastapi.testclient import TestClient
from src.app import app, activities
import pytest

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    # Reset activities before each test
    for act in activities.values():
        act['participants'].clear()
    activities['Chess Club']['participants'] = ["michael@mergington.edu", "daniel@mergington.edu"]
    activities['Programming Class']['participants'] = ["emma@mergington.edu", "sophia@mergington.edu"]
    activities['Gym Class']['participants'] = ["john@mergington.edu", "olivia@mergington.edu"]


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]
    assert isinstance(data["Chess Club"]["participants"], list)


def test_signup_prevents_duplicates():
    email = "test@mergington.edu"
    # First signup should succeed
    resp1 = client.post(f"/activities/Chess Club/signup?email={email}")
    assert resp1.status_code == 200
    # Second signup should fail
    resp2 = client.post(f"/activities/Chess Club/signup?email={email}")
    assert resp2.status_code == 400
    assert "already registered" in resp2.json()["detail"]


def test_delete_unregister_and_404():
    email = "remove@mergington.edu"
    # Add participant
    client.post(f"/activities/Chess Club/signup?email={email}")
    # Delete should succeed
    resp1 = client.delete(f"/activities/Chess Club/signup?email={email}")
    assert resp1.status_code == 200
    # Second delete should 404
    resp2 = client.delete(f"/activities/Chess Club/signup?email={email}")
    assert resp2.status_code == 404
    assert "not registered" in resp2.json()["detail"]
