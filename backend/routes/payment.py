from flask import Blueprint, request, jsonify
from routes.auth import get_current_user
from utils.database import save_payment, update_payment, upgrade_user_plan
import requests as req
from requests.auth import HTTPBasicAuth
import hmac, hashlib, os

payment_bp = Blueprint("payment", __name__)
KEY_ID = os.environ.get("RAZORPAY_KEY_ID","")
KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET","")
PRICE = 39900

@payment_bp.route("/create-order", methods=["POST"])
def create_order():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    resp = req.post("https://api.razorpay.com/v1/orders",
        auth=HTTPBasicAuth(KEY_ID, KEY_SECRET),
        json={"amount": PRICE, "currency": "INR",
              "receipt": f"rcpt_{user['id']}", "notes": {"user_id": str(user["id"])}})
    if resp.status_code != 200: return jsonify({"error": "Failed to create order"}), 500
    order = resp.json()
    save_payment(user["id"], order["id"], PRICE)
    return jsonify({"order_id": order["id"], "amount": PRICE, "currency": "INR",
                    "key_id": KEY_ID, "user_name": user["name"], "user_email": user["email"]})

@payment_bp.route("/verify", methods=["POST"])
def verify():
    user = get_current_user()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    order_id = data.get("razorpay_order_id","")
    payment_id = data.get("razorpay_payment_id","")
    signature = data.get("razorpay_signature","")
    msg = f"{order_id}|{payment_id}"
    expected = hmac.new(KEY_SECRET.encode(), msg.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature): return jsonify({"error": "Invalid signature"}), 400
    update_payment(order_id, payment_id, "paid")
    upgrade_user_plan(user["id"], "pro")
    return jsonify({"success": True, "message": "Payment verified! Welcome to Pro!"})

@payment_bp.route("/webhook", methods=["POST"])
def webhook():
    sig = request.headers.get("X-Razorpay-Signature","")
    body = request.get_data()
    secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET","")
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig): return jsonify({"error": "Invalid"}), 400
    event = request.json or {}
    if event.get("event") == "payment.captured":
        p = event["payload"]["payment"]["entity"]
        uid = p.get("notes",{}).get("user_id")
        if uid:
            upgrade_user_plan(int(uid), "pro")
            update_payment(p.get("order_id"), p.get("id"), "paid")
    return jsonify({"status": "ok"})
