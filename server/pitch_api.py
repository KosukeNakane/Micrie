# -----------------------------------------------
# 音声ファイルを受け取り、ffmpegで.wavに変換した後、
# CREPEを用いて音高を推定し、1小節を8分割して各セグメントの
# ピッチ、信頼度、RMSなどの情報をJSONで返すAPI
# FlaskのBlueprintを使用してルーティング処理を実装
# -----------------------------------------------
from flask import Blueprint, request, jsonify
import librosa
import tempfile
import os
import ffmpeg
from flask_cors import cross_origin
import crepe
import soundfile as sf
import numpy as np

pitch_bp = Blueprint("pitch", __name__)

# 音声ファイルを受け取り、ピッチ推定結果をJSONで返すエンドポイント
@pitch_bp.route('/pitch', methods=['POST'])
@cross_origin(origins='http://localhost:5173')
def analyze_pitch():
    print("✅ /pitch にリクエスト来たよ！")
    print("📦 リクエスト内容：", request.files)
    
    if 'file' not in request.files:
        print("No file received!") 
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    # 受け取ったファイルを一時保存し、.webm から .wav へ変換
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_webm:
        file.save(tmp_webm.name)
        webm_path = tmp_webm.name

    wav_path = webm_path.replace(".webm", ".wav")

    try:
        ffmpeg.input(webm_path).output(wav_path).run(quiet=True, overwrite_output=True)

        try:
            y, sr = sf.read(wav_path)
            # ステレオ音声はモノラルに変換し、サンプリングレートを16kHzに統一
            if len(y.shape) > 1:
                y = np.mean(y, axis=1)  # モノラル化

            if sr != 16000:
                y = librosa.resample(y, orig_sr=sr, target_sr=16000)
                sr = 16000

            # CREPE を用いて音高と信頼度を予測
            time, frequency, confidence, _ = crepe.predict(y, sr, viterbi=True)
        except Exception as e:
            print("❌ 音声読み込みまたはCREPE予測でエラー:", e)
            return jsonify({'error': 'Failed to load audio or predict pitch'}), 500

        # テンポ情報を元に、1小節を16分割し、各チャンクを生成
        tempo = float(request.form.get("tempo", 120))  
        bar_count = int(request.form.get("bar_count", 1))
        beat_duration = 60.0 / tempo
        total_duration = beat_duration * 4 * bar_count  # 1 bar = 4 beats
        chunk_duration = total_duration / (16 * bar_count)

        # 1秒あたりのフレーム数を推定
        fps = len(frequency) / total_duration
        frames_per_chunk = int(fps * chunk_duration)

        segments = []
        skip = int(frames_per_chunk * 0.1)
        margin = 0.05  # RMS計算のための50msのマージン作成(しゃくり除去)

        total_chunks = 16 * bar_count
        # 各チャンクに対してピッチとRMSを計算し、信頼度に基づいて rest か note を判定
        for i in range(total_chunks):
            original_start = i * frames_per_chunk
            original_end = (i + 1) * frames_per_chunk
            start = original_start
            end = original_end

            # 初期チャンクで仮のセグメントとピーク確認
            segment = frequency[start + skip:end]
            segment_conf = confidence[start + skip:end]
            peak_index = np.argmax(segment_conf)
            early_threshold = int(frames_per_chunk * 0.2)

            # ピークがチャンク先頭に近ければ、少し前倒し
            if peak_index < early_threshold and i > 0:
                shift = int(frames_per_chunk * 0.2)
                start = max(0, original_start - shift)
                end = original_end - shift
                segment = frequency[start + skip:end]
                segment_conf = confidence[start + skip:end]

            valid = [(hz, conf) for hz, conf in zip(segment, segment_conf) if hz > 0 and conf > 0.5]

            start_time = i * chunk_duration
            end_time = (i + 1) * chunk_duration

            start_sample = max(0, int((start_time - margin) * sr))
            end_sample = int((end_time + margin) * sr)
            segment_audio = y[start_sample:end_sample]
            segment_rms = np.sqrt(np.mean(np.square(segment_audio)))

            if not valid:
                confidence_rms_score = 0.0
                segments.append({
                    "label": "rest",
                    "note": "rest",
                    "hz": 0.0,
                    "confidence": 0.0,
                    "confidence_rms": float(confidence_rms_score),
                    "rms": float(segment_rms),
                    "start": round(start_time, 2),
                    "end": round(end_time, 2)
                })
                continue

            freqs, weights = zip(*valid)
            confidence_rms_score = np.mean([conf * segment_rms for conf in weights])
            if confidence_rms_score < 0.03:
                segments.append({
                    "label": "rest",
                    "note": "rest",
                    "hz": 0.0,
                    "confidence": float(confidence_rms_score),
                    "confidence_rms": float(confidence_rms_score),
                    "rms": float(segment_rms),
                    "start": round(start_time, 2),
                    "end": round(end_time, 2)
                })
            else:
                log_freqs = np.log2(freqs)
                log_weighted_avg = np.average(log_freqs, weights=weights)
                avg_pitch = 2 ** log_weighted_avg
                note_name = librosa.hz_to_note(avg_pitch).replace('♯', '#').replace('＃', '#')
                segments.append({
                    "label": note_name,
                    "note": note_name,
                    "hz": float(avg_pitch),
                    "confidence": float(segment_conf[peak_index]),
                    "confidence_rms": float(confidence_rms_score),
                    "rms": float(segment_rms),
                    "start": round(start_time, 2),
                    "end": round(end_time, 2)
                })

        return jsonify({'pitch_series': segments}), 200
    # 一時ファイルを削除
    finally:
        for path in [webm_path, wav_path]:
            if os.path.exists(path):
                os.remove(path)

__all__ = ["pitch_bp"]