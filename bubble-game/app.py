from flask import Flask, jsonify, render_template, request
from threading import Lock

app = Flask(__name__)

# Global metrics store
game_metrics = {
    "games_started": 0,
    "games_completed": 0,
    "bubbles_spawned": 0,
    "bubbles_clicked": 0,
    "bubbles_missed": 0
}

metrics_lock = Lock()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "bubble-burst-game"
    }), 200


@app.route("/metrics", methods=["GET"])
def metrics():
    with metrics_lock:
        bubbles_spawned = game_metrics["bubbles_spawned"]
        bubbles_clicked = game_metrics["bubbles_clicked"]
        bubbles_missed = game_metrics["bubbles_missed"]

        accuracy = 0.0
        if bubbles_spawned > 0:
            accuracy = round((bubbles_clicked / bubbles_spawned) * 100, 2)

        return jsonify({
            "games_started": game_metrics["games_started"],
            "games_completed": game_metrics["games_completed"],
            "bubbles_spawned": bubbles_spawned,
            "bubbles_clicked": bubbles_clicked,
            "bubbles_missed": bubbles_missed,
            "accuracy_percent": accuracy
        }), 200


@app.route("/api/game/start", methods=["POST"])
def game_start():
    with metrics_lock:
        game_metrics["games_started"] += 1

    return jsonify({
        "message": "Game started"
    }), 200


@app.route("/api/game/event", methods=["POST"])
def game_event():
    data = request.get_json(silent=True) or {}
    event_type = data.get("event")

    if event_type not in ["spawn", "click", "miss"]:
        return jsonify({
            "error": "Invalid event type"
        }), 400

    with metrics_lock:
        if event_type == "spawn":
            game_metrics["bubbles_spawned"] += 1
        elif event_type == "click":
            game_metrics["bubbles_clicked"] += 1
        elif event_type == "miss":
            game_metrics["bubbles_missed"] += 1

    return jsonify({
        "message": f"Recorded event: {event_type}"
    }), 200


@app.route("/api/game/end", methods=["POST"])
def game_end():
    with metrics_lock:
        game_metrics["games_completed"] += 1

        bubbles_spawned = game_metrics["bubbles_spawned"]
        bubbles_clicked = game_metrics["bubbles_clicked"]
        bubbles_missed = game_metrics["bubbles_missed"]

        accuracy = 0.0
        if bubbles_spawned > 0:
            accuracy = round((bubbles_clicked / bubbles_spawned) * 100, 2)

    return jsonify({
        "message": "Game completed",
        "summary": {
            "bubbles_spawned": bubbles_spawned,
            "bubbles_clicked": bubbles_clicked,
            "bubbles_missed": bubbles_missed,
            "accuracy_percent": accuracy
        }
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
