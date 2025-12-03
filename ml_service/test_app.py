import pytest

from app import app, compute_trend_score


@pytest.fixture()
def client():
    with app.test_client() as client:
        yield client


def test_compute_trend_score_buckets():
    scenarios = [
        {"args": (-50, 25, 25), "label": "Hot", "score": 90},
        {"args": (-10, 15, 20), "label": "Rising", "score": 75},
        {"args": (20, 10, 5), "label": "Stable", "score": 47.1},
        {"args": (50, 0, 0), "label": "Declining", "score": 21.5},
    ]

    for scenario in scenarios:
        result = compute_trend_score(*scenario["args"])
        assert result["label"] == scenario["label"]
        assert result["score"] == pytest.approx(scenario["score"], rel=0.01)
        assert result["score"] <= 100


def test_scores_are_capped():
    capped = compute_trend_score(rank_velocity=-1000, price_momentum=100, review_growth=100)

    assert capped["breakdown"]["rank_velocity"] == pytest.approx(40)
    assert capped["breakdown"]["price_momentum"] == pytest.approx(30)
    assert capped["breakdown"]["review_growth"] == pytest.approx(30)
    assert capped["score"] == pytest.approx(100)
    assert capped["label"] == "Hot"


def test_scores_never_exceed_hundred():
    overages = compute_trend_score(rank_velocity=-1000, price_momentum=300, review_growth=300)

    assert overages["score"] <= 100
    assert overages["label"] == "Hot"


def test_negative_inputs_floor_to_zero():
    minimums = compute_trend_score(rank_velocity=1000, price_momentum=-10, review_growth=-5)

    assert minimums["breakdown"]["rank_velocity"] >= 0
    assert minimums["breakdown"]["price_momentum"] == 0
    assert minimums["breakdown"]["review_growth"] == 0
    assert minimums["score"] <= 100
    assert minimums["label"] == "Declining"


def test_trend_score_endpoint_returns_json(client):
    payload = {"rank_velocity": -10, "price_momentum": 5, "review_growth": 10}
    response = client.post("/trend-score", json=payload)

    assert response.status_code == 200
    data = response.get_json()
    assert "score" in data and "label" in data and "breakdown" in data
    assert data["score"] <= 100
    assert data["breakdown"]["price_momentum"] == pytest.approx(5)


def test_trend_score_missing_fields_returns_400(client):
    response = client.post(
        "/trend-score", json={"rank_velocity": -10, "review_growth": 10}
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Missing required field 'price_momentum'" in data["errors"]


def test_trend_score_non_numeric_fields_return_400(client):
    response = client.post(
        "/trend-score",
        json={"rank_velocity": "fast", "price_momentum": 5, "review_growth": 10},
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Field 'rank_velocity' must be numeric" in data["errors"]


def test_trend_score_invalid_json_returns_400(client):
    response = client.post(
        "/trend-score", data="not json", content_type="application/json"
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Invalid JSON payload" in data["errors"]
