# -----------------------------------------------
# Flask アプリケーションのエントリーポイント
# Whisper, Predict, Pitch 各APIを Blueprint として登録し、
# CORSを有効化したうえでサーバーを起動
# -----------------------------------------------

# FlaskおよびCORSモジュール、各API Blueprint をインポート
from flask import Flask, jsonify
from flask_cors import CORS
from whisper_api import whisper_bp
from predict_api import predict_bp
from pitch_api import pitch_bp

import os
import re


# Allow only local dev and Vercel origins (Preview + Production). If you have a fixed
# production domain (e.g., https://micrie.vercel.app), set it via ENV `PROD_ORIGIN`.
app = Flask(__name__)
allowed_origins = [
    "http://localhost:5173",
    re.compile(r"^https://.*\.vercel\.app$")
]
prod_origin = os.getenv("PROD_ORIGIN")
if prod_origin:
    allowed_origins.append(prod_origin)

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

app.register_blueprint(whisper_bp)  # Whisper API（音声認識）を登録
app.register_blueprint(predict_bp)  # Predict API（音声分類）を登録
app.register_blueprint(pitch_bp)    # Pitch API（音高推定）を登録

# Health check endpoint
@app.get("/health")
def health():
    return jsonify({"ok": True})

# スクリプトとして実行された場合に Flask サーバーを起動
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=False)