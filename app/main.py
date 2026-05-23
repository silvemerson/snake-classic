from flask import Flask, render_template, jsonify
from datetime import datetime

app = Flask(__name__)

scores = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/health")
def health():
    return jsonify({"status": "ok", "time": datetime.utcnow().isoformat()})

@app.route("/scores", methods=["GET"])
def get_scores():
    top = sorted(scores, key=lambda x: x["score"], reverse=True)[:10]
    return jsonify(top)

@app.route("/scores/<name>/<int:score>", methods=["POST"])
def post_score(name, score):
    scores.append({"name": name[:20], "score": score, "time": datetime.utcnow().isoformat()})
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)
