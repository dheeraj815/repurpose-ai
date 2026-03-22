from flask import Blueprint, request, jsonify
from routes.auth import get_current_user
from utils.database import get_today_usage, increment_usage, save_generation, get_user_generations, get_generation_by_id
from utils.ai_engine import repurpose_content, fetch_youtube_transcript

generate_bp = Blueprint("generate", __name__)

@generate_bp.route("/", methods=["POST"])
def generate():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    plan = user.get("plan","free")
    if plan == "free" and get_today_usage(user["id"]) >= 3:
        return jsonify({"error": "Daily limit reached. Upgrade to Pro."}), 429
    data = request.json or {}
    source_text = data.get("source_text","").strip()
    if len(source_text) < 50: return jsonify({"error": "Please provide at least 50 characters"}), 400
    try:
        results = repurpose_content(source_text)
        gid = save_generation(user["id"], data.get("source_type","text"), source_text, results, data.get("source_url"))
        increment_usage(user["id"])
        return jsonify({"success": True, "generation_id": gid, "results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@generate_bp.route("/youtube", methods=["POST"])
def youtube():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    url = (request.json or {}).get("url","")
    try:
        transcript, vid = fetch_youtube_transcript(url)
        return jsonify({"transcript": transcript, "video_id": vid, "length": len(transcript)})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@generate_bp.route("/history", methods=["GET"])
def history():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"generations": get_user_generations(user["id"], int(request.args.get("limit",30)))})

@generate_bp.route("/history/<int:gid>", methods=["GET"])
def get_gen(gid):
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    gen = get_generation_by_id(gid, user["id"])
    if not gen: return jsonify({"error": "Not found"}), 404
    return jsonify({"generation": gen})
