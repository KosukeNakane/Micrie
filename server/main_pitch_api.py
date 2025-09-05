from flask import Flask, jsonify
from flask_cors import CORS
from pitch_api import pitch_bp, warmup_crepe
import os
import re

# Flask アプリ作成
app = Flask(__name__)

# セキュリティ: CORS を限定、リクエストサイズを制限
allowed_origins = [
    "http://localhost:5173",
    re.compile(r"^https://.*\.vercel\.app$")
]
prod_origin = os.getenv("PROD_ORIGIN")
if prod_origin:
    allowed_origins.append(prod_origin)

# 最大アップロードサイズ（MB）を制限（デフォルト 25MB）
max_mb = float(os.getenv("MAX_CONTENT_LENGTH_MB", "25"))
app.config["MAX_CONTENT_LENGTH"] = int(max_mb * 1024 * 1024)

CORS(
    app,
    resources={r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False,
        "max_age": 86400
    }}
)

# pitch用の Blueprint を登録
app.register_blueprint(pitch_bp)

# CREPE モデルをウォームアップ（初回遅延対策）
try:
    warmup_crepe()
except Exception as e:
    # ウォームアップ失敗しても起動は継続（初回アクセス時にロードされる）
    print("⚠️ CREPE ウォームアップ失敗:", e)

# Health check endpoint
@app.get("/health")
def health():
    return jsonify({"ok": True})

# Warmup endpoint（コールドスタート回避のために起動直後に叩く）
@app.get("/warmup")
def warmup():
    try:
        warmup_crepe()
        return jsonify({"warmed": True})
    except Exception as e:
        return jsonify({"warmed": False, "error": str(e)}), 500

# Cloud Run が参照するアプリ本体
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
