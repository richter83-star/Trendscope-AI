from flask import Flask, jsonify, request
from werkzeug.exceptions import BadRequest
from math import tanh

app = Flask(__name__)


def compute_trend_score(rank_velocity: float, price_momentum: float, review_growth: float) -> dict:
    rank_score = max(0, min(40, (1 - tanh(rank_velocity / 100)) * 40))
    price_score = max(0, min(30, price_momentum))
    review_score = max(0, min(30, review_growth))
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
    try:
        payload = request.get_json()
    except BadRequest:
        return jsonify({"errors": ["Invalid JSON payload"]}), 400

    if payload is None:
        return jsonify({"errors": ["Request body must be a JSON object"]}), 400

    if not isinstance(payload, dict):
        return jsonify({"errors": ["Request body must be a JSON object"]}), 400

    errors = []
    values = {}
    required_fields = ["rank_velocity", "price_momentum", "review_growth"]

    for field in required_fields:
        if field not in payload:
            errors.append(f"Missing required field '{field}'")
            continue

        value = payload[field]

        if isinstance(value, bool):
            errors.append(f"Field '{field}' must be numeric")
            continue

        try:
            values[field] = float(value)
        except (TypeError, ValueError):
            errors.append(f"Field '{field}' must be numeric")

    if errors:
        return jsonify({"errors": errors}), 400

    return jsonify(
        compute_trend_score(
            values["rank_velocity"], values["price_momentum"], values["review_growth"]
        )
    )


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
