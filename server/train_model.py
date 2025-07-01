# -----------------------------------------------
# オーディオファイルから特徴量を抽出し、
# KICK / SNARE / HIHAT / NOISE を分類する機械学習モデルを学習・保存
# また、学習済みモデルを用いた8分割予測関数も含む
# -----------------------------------------------
import os
import numpy as np
import tensorflow as tf
import librosa
from sklearn.model_selection import train_test_split

DATASET_DIR = "./dataset"
CATEGORIES = ["kick", "snare", "hihat", "noise"]

# オーディオ波形 y から各種音響特徴量を抽出してベクトル化する関数
def extract_features_from_y(y, sr):
    # チャンクの末尾10%をカット（発音のめり込み対策）
    y = y[:int(len(y) * 0.9)]
    # MFCCとそのデルタ
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    delta_mfccs = librosa.feature.delta(mfccs)

    # 音響的特徴量
    zcr = librosa.feature.zero_crossing_rate(y)
    rms = librosa.feature.rms(y=y)
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    flatness = librosa.feature.spectral_flatness(y=y)
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)

    # スペクトルフラックス: 周波数成分の時間変化
    S = np.abs(librosa.stft(y))
    spectral_flux = np.sqrt(np.mean(np.diff(S, axis=1)**2))

    # クロマ特徴量: 高さ情報を圧縮して12次元で表現
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)

    # 高域エネルギー（hihat対策）: 4000Hz以上の帯域のパワー比
    freqs = librosa.fft_frequencies(sr=sr)
    high_freq_mask = freqs >= 4000
    high_energy = np.mean(S[high_freq_mask, :])
    total_energy = np.mean(S)
    high_energy_ratio = high_energy / (total_energy + 1e-6)  # 0割防止

    # 低域エネルギー（kick補強用）: 0〜250Hz帯域
    low_freq_mask = freqs <= 250
    low_energy = np.mean(S[low_freq_mask, :])
    low_energy_ratio = low_energy / (total_energy + 1e-6)

    # 平均・標準偏差等でベクトル化
    features = np.concatenate([
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
        np.array([high_energy_ratio]).flatten(),
        np.array([spectral_flux]).flatten(),
        np.array([low_energy_ratio]).flatten(),  # ★ 追加
        np.mean(chroma, axis=1),
        np.std(chroma, axis=1)
    ])
    return features

# 指定された音声ファイルから特徴量を抽出するラッパー関数
def extract_features(file_path):
    print(f"📂 特徴抽出中: {file_path}")
    y, sr = librosa.load(file_path, sr=16000)
    return extract_features_from_y(y, sr)

X, y = [], []

# データセット内の各カテゴリについて、音声ファイルから特徴量を抽出して学習データを構築
for idx, label in enumerate(CATEGORIES):
    label_dir = os.path.join(DATASET_DIR, label)
    if not os.path.isdir(label_dir):
        print(f"⚠️ ディレクトリが存在しません: {label_dir}")
        continue
    for fname in os.listdir(label_dir):
        if fname.endswith(".wav"):
            path = os.path.join(label_dir, fname)
            print(f"📂 特徴抽出中: {path}")
            if not os.path.isfile(path):
                continue
            try:
                y_audio, sr = librosa.load(path, sr=16000)
                rms_max = np.max(librosa.feature.rms(y=y_audio))
                # RMS（音量）が小さい場合は無音と判定し、noiseとして扱う
                if label == "kick" and rms_max < 0.007:
                    print("🔇 Kick無音と判断 → noise特徴量")
                    features = np.zeros(105)
                    X.append(features)
                    y.append(idx)
                    continue
                elif rms_max < 0.01:
                    print("🔇 無音と判断 → noise特徴量")
                    features = np.zeros(105)
                    X.append(features)
                    y.append(idx)
                    continue  # 拡張はスキップ
                features = extract_features_from_y(y_audio, sr)
                X.append(features)
                y.append(idx)
                # ピッチシフトによるデータ拡張（±2音）
                for n_steps in [-2, 2]:
                    try:
                        y_shifted = librosa.effects.pitch_shift(y_audio, sr=sr, n_steps=n_steps)
                        features_shifted = extract_features_from_y(y_shifted, sr)
                        X.append(features_shifted)
                        y.append(idx)
                    except Exception as e:
                        print(f"⚠️ pitch shift エラー（{path}, {n_steps}）: {e}")
            except Exception as e:
                print(f"❌ エラー {path}: {e}")

X = np.array(X)
y = np.array(y)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# シンプルな3層の全結合ニューラルネットワークモデルを構築
model = tf.keras.models.Sequential([
    tf.keras.layers.Input(shape=(X.shape[1],)),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(len(CATEGORIES), activation='softmax')
])

# モデルの最適化手法と損失関数、評価指標を設定
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# バリデーション損失が改善しなくなった場合に早期終了するコールバックを設定
early_stop = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)

# モデルの学習を実行（バリデーションデータ付き）
model.fit(X_train, y_train, epochs=30, batch_size=16, validation_data=(X_test, y_test), callbacks=[early_stop])

# テストデータで学習済みモデルの性能を評価
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"🧪 テスト精度: {test_acc:.4f}")

# モデル保存用のディレクトリを作成（既に存在する場合はスキップ）
os.makedirs("./model", exist_ok=True)
model.save("./model/micrie_model.keras")
print("✅ モデル保存完了: ./model/micrie_model.keras")

# 指定ファイルをテンポに基づいて8分割し、それぞれに対して推論を実行
def predict(file_path, model, tempo):
    y_full, sr = librosa.load(file_path, sr=16000)
    total_duration = 60.0 / tempo * 4
    chunk_duration = total_duration / 8

    onset_env = librosa.onset.onset_strength(y=y_full, sr=sr)
    onset_frames = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, backtrack=True)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    features_list = []
    adjusted_starts = []
    results = []
    for i in range(8):
        chunk_start = i * chunk_duration
        search_start = chunk_start - 0.5 * chunk_duration
        # スナップ対象はチャンク先頭より前（±0.5チャンク内）のonsetのみに限定
        candidate_onsets = [onset for onset in onset_times if search_start <= onset < chunk_start]

        # チャンクの開始位置を、近傍のonset（発音開始）にスナップして調整
        if candidate_onsets:
            onset = max(candidate_onsets)
            shift = onset - chunk_start
            adjusted_start = chunk_start + shift
        else:
            adjusted_start = chunk_start

        adjusted_end = adjusted_start + chunk_duration
        y_chunk = y_full[int(sr * adjusted_start) : int(sr * adjusted_end)]

        rms = librosa.feature.rms(y=y_chunk)
        # RMSが小さい場合は無音と判定し、noiseとして処理
        if np.max(rms) < 0.01:
            results.append({
                "label": "noise",
                "start": round(chunk_start, 2),
                "end": round(chunk_start + chunk_duration, 2),
                "adjustedStart": round(adjusted_start, 4),
                "scores": [0, 0, 0, 1]
            })
            features = np.zeros(105)
            features_list.append(features)
            adjusted_starts.append(adjusted_start)
            continue

        features = extract_features_from_y(y_chunk, sr)
        features_list.append(features)
        adjusted_starts.append(adjusted_start)

    # 有効なチャンクが存在する場合に推論処理を行う
    if features_list:
        features_array = np.array(features_list)
        predictions = model.predict(features_array)
        predicted_labels = np.argmax(predictions, axis=1)

        label_names = CATEGORIES
        j = 0
        for i in range(8):
            chunk_start = i * chunk_duration
            chunk_end = chunk_start + chunk_duration
            # すでにnoiseとして結果が入っている場合はスキップ
            if any(r["start"] == round(chunk_start, 2) for r in results):
                continue
            results.append({
                "label": label_names[predicted_labels[j]],
                "start": round(chunk_start, 2),
                "end": round(chunk_end, 2),
                "adjustedStart": round(adjusted_starts[j], 4),  # スナップ後の解析開始位置を追加
                "scores": [round(score, 6) for score in predictions[j].tolist()]
            })
            j += 1
    return results