from flask import Blueprint, request, jsonify
from utils.database import get_user_by_email, create_user, get_user_by_id
import bcrypt, jwt, os
from datetime import datetime, timedelta

auth_bp = Blueprint("auth", __name__)
SECRET = os.environ.get("SECRET_KEY", "repurposeai-secret-2024")

def make_token(uid):
    return jwt.encode({"user_id": uid, "exp": datetime.utcnow() + timedelta(days=30)}, SECRET, algorithm="HS256")

def verify_token(token):
    try:
        data = jwt.decode(token, SECRET, algorithms=["HS256"])
        return data.get("user_id")
    except: return None

def get_current_user():
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "")
    uid = verify_token(token)
    if not uid: return None
    return get_user_by_id(uid)

def safe_user(u):
    return {"id": u["id"], "name": u["name"], "email": u["email"], "plan": u["plan"], "created_at": u["created_at"]}

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    name = data.get("name","").strip()
    email = data.get("email","").strip()
    password = data.get("password","")
    if not all([name, email, password]): return jsonify({"error": "All fields required"}), 400
    if len(password) < 6: return jsonify({"error": "Password must be at least 6 characters"}), 400
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    result = create_user(email, pw_hash, name)
    if not result["success"]: return jsonify({"error": result["error"]}), 409
    token = make_token(result["user_id"])
    user = get_user_by_id(result["user_id"])
    return jsonify({"token": token, "user": safe_user(user)}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email","").strip()
    password = data.get("password","")
    user = get_user_by_email(email)
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401
    token = make_token(user["id"])
    return jsonify({"token": token, "user": safe_user(user)})

@auth_bp.route("/me", methods=["GET"])
def me():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"user": safe_user(user)})
