# -----------------------------------------------
# アップロードされた音声ファイルを受け取り、
# テンポに基づいて音声を8分割し、各チャンクから特徴量を抽出して分類
# 推論結果はJSONとして返却し、CSVにログとして保存
# FlaskのBlueprintを使用してエンドポイントを提供
# -----------------------------------------------
from flask import Blueprint, request, jsonify
import numpy as np
import librosa
import os
import tempfile
import ffmpeg
from keras.models import load_model
import csv
from datetime import datetime


# 音声信号から様々な音響特徴量を抽出して、1次元の特徴ベクトルとして返す関数
# 拡張された特徴抽出関数
def extract_features(y, sr):
    print("📂 特徴抽出中（推論）")

    # 無音判定: RMS最大値が閾値未満ならnoiseとみなす
    if np.max(librosa.feature.rms(y=y)) < 0.05:
        print("🔇 無音と判断: noise特徴量を返します")
        return np.zeros(104) 

    """拡張された特徴抽出関数: MFCC(13), ΔMFCC, ZCR, RMS, Centroidなど"""
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    width = min(5, mfccs.shape[1] // 2 * 2 + 1)
    delta_mfccs = librosa.feature.delta(mfccs, width=width)
    zcr = librosa.feature.zero_crossing_rate(y)
    rms = librosa.feature.rms(y=y)
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    flatness = librosa.feature.spectral_flatness(y=y)
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)

    freqs = librosa.fft_frequencies(sr=sr)
    S = np.abs(librosa.stft(y))
    high_freq_mask = freqs >= 4000
    high_energy = np.mean(S[high_freq_mask, :])
    total_energy = np.mean(S)
    high_energy_ratio = high_energy / (total_energy + 1e-6)

    spectral_flux = np.sqrt(np.mean(np.diff(S, axis=1)**2))
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)

    feature_vector = np.concatenate([
      np.mean(mfccs, axis=1),
      np.std(mfccs, axis=1),
      np.mean(delta_mfccs, axis=1),
      np.std(delta_mfccs, axis=1),
      np.mean(zcr, axis=1),
      np.std(zcr, axis=1),
      np.mean(rms, axis=1),
      np.std(rms, axis=1),
      np.mean(centroid, axis=1),
      np.std(centroid, axis=1),
      np.mean(bandwidth, axis=1),
      np.std(bandwidth, axis=1),
      np.mean(flatness, axis=1),
      np.std(flatness, axis=1),
      np.mean(rolloff, axis=1),
      np.std(rolloff, axis=1),
      np.mean(contrast, axis=1),
      np.std(contrast, axis=1),
      np.array([spectral_flux]).flatten(),
      np.array([high_energy_ratio]), 
      np.mean(chroma, axis=1),
      np.std(chroma, axis=1)
    ])
    if feature_vector.shape[0] != 104:
        print(f"⚠️ 特徴ベクトルの次元が不正です: {feature_vector.shape}")
    return feature_vector

# 推論結果（各チャンクのラベルとスコア）をCSVファイルに追記する関数
CSV_LOG_PATH = "./prediction_log.csv"

def log_to_csv(segments):
    """チャンク毎のスコアと予測ラベルをCSVに追記"""
    file_exists = os.path.isfile(CSV_LOG_PATH)

    with open(CSV_LOG_PATH, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["timestamp", "chunk", "start", "end", "kick", "snare", "hihat", "noise", "label"])

        timestamp = datetime.now().isoformat()
        for i, seg in enumerate(segments):
            writer.writerow([
                timestamp,
                f"chunk_{i}",
                seg["start"],
                seg["end"],
                *seg["scores"],
                seg["label"]
            ])


predict_bp = Blueprint("predict", __name__)

# モデルの読み込みと初期設定
model_path = os.path.join(os.path.dirname(__file__), "model", "micrie_model.keras")
print(f"📦 モデル読み込み中: {model_path}")
model = load_model(model_path)
print("✅ モデル読み込み完了")
labels = ["kick", "snare", "hihat", "noise"]

# /predict エンドポイント：音声ファイルを受け取り、チャンクごとに特徴量抽出と推論を行い、結果を返す
@predict_bp.route("/predict", methods=["POST"])
def predict():
    file = request.files["file"]
    tempo = float(request.form.get("tempo", 120))

    # アップロードされたファイルを一時的に保存し、webm形式からwav形式に変換
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_webm:
        file.save(tmp_webm.name)
        webm_path = tmp_webm.name

    wav_path = webm_path.replace(".webm", ".wav")

    try:
        # webm → wav に変換
        ffmpeg.input(webm_path).output(wav_path).run(quiet=True, overwrite_output=True)

        # 全体の音声を読み込み
        y_full, sr = librosa.load(wav_path, sr=16000)

        # 音声全体からオンセット（発音の始まり）を検出して時間情報を取得
        onset_env = librosa.onset.onset_strength(y=y_full, sr=sr)
        onset_frames = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, backtrack=True)
        onset_times = librosa.frames_to_time(onset_frames, sr=sr)

        if len(onset_times) < 9:
            duration = librosa.get_duration(y=y_full, sr=sr)
            onset_times = list(onset_times) + [duration] * (9 - len(onset_times))
        onset_times = onset_times[:9]

        results = []

        # テンポ情報に基づいて1小節を8つのチャンクに分割する設定
        beat_duration = 60.0 / tempo
        total_duration = beat_duration * 4
        chunk_duration = total_duration / 8

        # 各チャンクについて特徴量を抽出し、推論を行う
        for i in range(8):
            nominal_start = i * chunk_duration
            nominal_end = nominal_start + chunk_duration
            search_start = max(0, nominal_start - chunk_duration / 2)
            search_end = nominal_start

            # スナップ対象となる onset を探索（前のみ）
            candidate_onsets = [t for t in onset_times if search_start <= t < search_end]
            if candidate_onsets:
                onset = max(candidate_onsets)
                shift = onset - nominal_start
            else:
                shift = 0.0

            adjusted_start = nominal_start + shift
            adjusted_end = adjusted_start + chunk_duration
            y_chunk = y_full[int(sr * adjusted_start):int(sr * adjusted_end)]
            y_chunk = y_chunk[:int(len(y_chunk) * 0.9)]  # チャンクの末尾10%をカット（めり込み防止）

            # 無音や音声が短すぎる場合は noise として扱う
            if y_chunk.shape[0] == 0:
                results.append({"label": "noise", "start": round(nominal_start, 2), "end": round(nominal_end, 2), "adjustedStart": round(adjusted_start, 4), "scores": [0,0,0,1]})
                continue

            feature_vector = extract_features(y_chunk, sr)
            feature_vector = feature_vector.reshape(1, -1)

            try:
                print("📐 特徴ベクトル shape:", feature_vector.shape)
                print("🔍 モデル expected input shape:", model.input_shape)
                pred = model.predict(feature_vector)
                predicted_index = np.argmax(pred[0])
            except Exception as e:
                print("❌ 推論エラー:", str(e))
                raise

            label = labels[predicted_index]

            print(f"🎯 チャンク {i}: {round(adjusted_start,2)}s ~ {round(adjusted_end,2)}s")
            print("    🔢 予測スコア:", pred[0])
            print("    🏷️ 予測ラベル:", label)

            results.append({
                "label": label,
                "start": round(nominal_start, 2),
                "end": round(nominal_end, 2),
                "adjustedStart": round(adjusted_start, 4),
                "scores": [round(score, 6) for score in pred[0].tolist()]
            })

        # 推論結果をCSVログに保存
        log_to_csv(results)
        return jsonify({"segments": results})
    
    except Exception as e:
        print("🔥 エラー発生:", str(e))
        return jsonify({"error": str(e)}), 500

    # 一時ファイルを削除して後処理
    finally:
        for path in [webm_path, wav_path]:
            if os.path.exists(path):
                os.remove(path)


__all__ = ["predict_bp"]