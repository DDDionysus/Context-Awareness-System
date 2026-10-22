from threading import Lock

from flask import Flask, jsonify, request

app = Flask(__name__)

current_context = None
context_lock = Lock()


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.post("/context")
def receive_context():
    global current_context

    context = request.get_json(silent=True)

    if not isinstance(context, dict):
        return jsonify(error="Expected a JSON object"), 400

    required_fields = {
        "source",
        "event",
        "timestamp",
        "url",
        "page_title",
        "viewport",
        "visible_elements",
    }

    missing_fields = required_fields - context.keys()

    if missing_fields:
        return jsonify(
            error="Missing required fields",
            fields=sorted(missing_fields),
        ), 400

    if not isinstance(context["viewport"], dict):
        return jsonify(error="viewport must be an object"), 400

    if not isinstance(context["visible_elements"], list):
        return jsonify(error="visible_elements must be a list"), 400

    with context_lock:
        current_context = context

    app.logger.info(
        "Current context updated: url=%s elements=%d",
        context["url"],
        len(context["visible_elements"]),
    )

    return jsonify(status="received")


@app.get("/context/current")
def get_current_context():
    with context_lock:
        context = current_context

    if context is None:
        return jsonify(
            status="empty",
            context=None,
        )

    return jsonify(
        status="available",
        context=context,
    )


if __name__ == "__main__":
    app.logger.setLevel("INFO")
    app.run(host="127.0.0.1", port=5000, debug=False)
    