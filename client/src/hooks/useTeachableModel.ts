// RYHTHMモードにて、Teachable Machine で学習した音声認識モデルを使用して、発話ラベルをリアルタイムで取得するカスタムフック
// 認識されたラベルは state として返される

import { useEffect, useState } from "react";
import * as speechCommands from "@tensorflow-models/speech-commands";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';


export const useTeachableModel = () => {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    // 音声認識器のインスタンスを保持する変数（useEffect内で初期化）
    let recognizer: speechCommands.SpeechCommandRecognizer;

    // モデルの読み込みと音声認識のlistenを開始する関数
    const loadAndListen = async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      recognizer = speechCommands.create(
        "BROWSER_FFT",
        undefined,
        "/model/model.json",
        "/model/metadata.json"
      );

      await recognizer.ensureModelLoaded();

      // 音声をリアルタイムで解析し、スコアが最も高いラベルをstateにセット
      recognizer.listen((result: speechCommands.SpeechCommandRecognizerResult) => {
        const scores = Array.from(result.scores as Float32Array);
        const labels = recognizer.wordLabels();
        const topIdx = scores.indexOf(Math.max(...scores));
        setLabel(labels[topIdx]);
        return Promise.resolve();
      }, {
        probabilityThreshold: 0.75,
      });
    };

    loadAndListen();

    // コンポーネントのアンマウント時にlistenを停止
    return () => {
      recognizer?.stopListening();
    };
  }, []);

  return label;
};