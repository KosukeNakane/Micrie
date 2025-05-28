# -----------------------------------------------
# Flask アプリケーションのエントリーポイント
# Whisper, Predict, Pitch 各APIを Blueprint として登録し、
# CORSを有効化したうえでサーバーを起動
# -----------------------------------------------

# FlaskおよびCORSモジュール、各API Blueprint をインポート
from flask import Flask
from flask_cors import CORS
from whisper_api import whisper_bp
from predict_api import predict_bp
from pitch_api import pitch_bp

# Flaskアプリケーションのインスタンスを生成し、CORSを有効化
app = Flask(__name__)
CORS(app)

app.register_blueprint(whisper_bp)  # Whisper API（音声認識）を登録
app.register_blueprint(predict_bp)  # Predict API（音声分類）を登録
app.register_blueprint(pitch_bp)    # Pitch API（音高推定）を登録

# スクリプトとして実行された場合に Flask サーバーを起動
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5172, debug=True)