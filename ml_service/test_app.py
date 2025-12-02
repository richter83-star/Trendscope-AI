import pytest

from app import app, compute_trend_score


@pytest.fixture()
def client():
    with app.test_client() as client:
        yield client


def test_compute_trend_score_buckets():
    hot = compute_trend_score(rank_velocity=-50, price_momentum=25, review_growth=25)
    rising = compute_trend_score(rank_velocity=-20, price_momentum=15, review_growth=20)
    stable = compute_trend_score(rank_velocity=20, price_momentum=10, review_growth=5)
    declining = compute_trend_score(rank_velocity=50, price_momentum=0, review_growth=0)

    assert hot["label"] == "Hot"
    assert rising["label"] == "Rising"
    assert stable["label"] == "Stable"
    assert declining["label"] == "Declining"


def test_trend_score_endpoint_returns_json(client):
    payload = {"rank_velocity": -10, "price_momentum": 5, "review_growth": 10}
    response = client.post("/trend-score", json=payload)

    assert response.status_code == 200
    data = response.get_json()
    assert "score" in data and "label" in data and "breakdown" in data
    assert data["breakdown"]["price_momentum"] == pytest.approx(5)
