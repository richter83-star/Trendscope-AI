from flask import Flask, jsonify, request
from math import tanh

app = Flask(__name__)


def compute_trend_score(rank_velocity: float, price_momentum: float, review_growth: float) -> dict:
    rank_score = (1 - tanh(rank_velocity / 100)) * 40
    price_score = max(0, min(30, price_momentum))
    review_score = min(30, max(0, review_growth))
    total = round(rank_score + price_score + review_score, 1)

    if total >= 80:
        label = "Hot"
    elif total >= 60:
        label = "Rising"
    elif total >= 40:
        label = "Stable"
    else:
        label = "Declining"

    return {
        "score": total,
        "label": label,
        "breakdown": {
            "rank_velocity": round(rank_score, 1),
            "price_momentum": round(price_score, 1),
            "review_growth": round(review_score, 1),
        },
    }


@app.route("/trend-score", methods=["POST"])
def trend_score():
    payload = request.get_json(force=True)
    rank_velocity = float(payload.get("rank_velocity", 0))
    price_momentum = float(payload.get("price_momentum", 0))
    review_growth = float(payload.get("review_growth", 0))
    return jsonify(compute_trend_score(rank_velocity, price_momentum, review_growth))


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
