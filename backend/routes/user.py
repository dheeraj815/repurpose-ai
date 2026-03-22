from flask import Blueprint, request, jsonify
from routes.auth import get_current_user
from utils.database import get_saved_posts, save_post, delete_saved_post, get_dashboard_stats, get_today_usage

user_bp = Blueprint("user", __name__)

@user_bp.route("/dashboard", methods=["GET"])
def dashboard():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    return jsonify(get_dashboard_stats(user["id"]))

@user_bp.route("/saved", methods=["GET"])
def get_saved():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"posts": get_saved_posts(user["id"])})

@user_bp.route("/saved", methods=["POST"])
def add_saved():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    save_post(user["id"], data.get("platform"), data.get("content"), data.get("generation_id"))
    return jsonify({"success": True})

@user_bp.route("/saved/<int:pid>", methods=["DELETE"])
def del_saved(pid):
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    delete_saved_post(pid, user["id"])
    return jsonify({"success": True})

@user_bp.route("/usage", methods=["GET"])
def usage():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    plan = user.get("plan","free")
    today = get_today_usage(user["id"])
    return jsonify({"today_usage": today, "limit": None if plan=="pro" else 3, "plan": plan})
