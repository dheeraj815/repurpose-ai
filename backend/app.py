from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.generate import generate_bp
from routes.payment import payment_bp
from routes.user import user_bp
from utils.database import init_db
import os

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "repurposeai-secret-2024")
    CORS(app, origins=["*"], supports_credentials=True)
    init_db()
    app.register_blueprint(auth_bp,     url_prefix="/api/auth")
    app.register_blueprint(generate_bp, url_prefix="/api/generate")
    app.register_blueprint(payment_bp,  url_prefix="/api/payment")
    app.register_blueprint(user_bp,     url_prefix="/api/user")
    @app.route("/health")
    def health():
        return {"status": "ok", "message": "RepurposeAI API running"}
    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
