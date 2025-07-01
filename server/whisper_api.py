# -----------------------------------------------
# Whisperモデルを用いた音声解析API
# ・音声全体をテキスト化するエンドポイント（/analyze_whisper）
# ・音声を8分割してキック/スネア/ハイハットを推定するエンドポイント（/analyze）
# FlaskのBlueprintを使用し、ffmpegによる変換と一時ファイル処理を含む
# -----------------------------------------------
from flask import Blueprint, request, jsonify
import os
import whisper
import tempfile
import ffmpeg

whisper_bp = Blueprint("whisper", __name__)

print("🔄 Whisper モデル読み込み中...")
# Whisperモデル（tiny）を読み込み、推論に備える
whisper_model = whisper.load_model("tiny")
print("✅ Whisper モデル読み込み完了")

# --------------------------
# Whisperによる解析
# --------------------------
# 音声ファイルを受け取り、Whisperでテキストに変換して返すエンドポイント
@whisper_bp.route("/analyze_whisper", methods=["POST"])
def analyze_whisper():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file"}), 400

    path = "temp_whisper.wav"
    file.save(path)
    result = whisper_model.transcribe(path, language="ja")
    return jsonify({"text": result["text"]})

# 音声ファイルとテンポ情報を受け取り、1小節を8分割して分類ラベルを推定するエンドポイント
@whisper_bp.route("/analyze", methods=["POST"])
def analyze():
    print("✅ /analyze にリクエスト来たよ！")
    print("📦 リクエスト内容：", request.files)
    if "file" not in request.files:
        print("No file received!") 
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    # テンポから1小節の長さを計算し、8分割されたチャンクの長さを求める
    tempo = float(request.form.get("tempo", 120))  # default tempo = 120
    bar_count = int(request.form.get("bar_count", 1))  # default 1 bar

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_webm:
        file.save(tmp_webm.name)
        webm_path = tmp_webm.name

    wav_path = webm_path.replace(".webm", ".wav")
    try:
        ffmpeg.input(webm_path).output(wav_path).run(quiet=True, overwrite_output=True)

        beat_duration = 60.0 / tempo
        total_duration = beat_duration * 4 * bar_count  # 小節数に応じた全体時間
        chunk_duration = total_duration / (8 * bar_count)  # 各チャンクの長さ

        # Whisperが出力した文字列に対してキック・スネア・ハイハットを識別するためのキーワード群
        kick_keywords = ["ボ", "ぼ", "ぶ", "ブ", "ダ", "だ", "ド", "ど", "デ", "で", "B"]
        hihat_keywords = ["ツ", "つ", "チ", "ち", "2"]
        snare_keywords = ["パ", "ぱ"]

        segments = []

        # 音声を(8*bar_count)分割し、それぞれをWhisperで文字起こしして分類する
        for i in range(8 * bar_count):
            start = i * chunk_duration
            end = start + chunk_duration
            chunk_path = wav_path.replace(".wav", f"_chunk{i}.wav")
            ffmpeg.input(wav_path, ss=start, t=chunk_duration).output(chunk_path).run(quiet=True, overwrite_output=True)

            result = whisper_model.transcribe(chunk_path, language="ja")
            text = result["text"]

            if any(k in text for k in kick_keywords):
                label = "kick"
            elif any(k in text for k in hihat_keywords):
                label = "hihat"
            elif any(k in text for k in snare_keywords):
                label = "snare"
            else:
                label = "不明"

            segments.append({"label": label, "start": round(start, 2), "end": round(end, 2)})

            # 一時的に生成したチャンクファイルを削除
            os.remove(chunk_path)

        return jsonify({
            "text": " | ".join(s["label"] for s in segments),
            "segments": segments
        }), 200
    # 元のwebmファイルと変換後のwavファイルを削除して後始末
    finally:
        for path in [webm_path, wav_path]:
            if os.path.exists(path):
                os.remove(path)

__all__ = ["whisper_bp"]