import * as tf from '@tensorflow/tfjs';
import * as speechCommands from "@tensorflow-models/speech-commands";
import { useEffect, useState } from "react";
import '@tensorflow/tfjs-backend-webgl';

export const useTeachableModel = () => {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    let recognizer: speechCommands.SpeechCommandRecognizer;
    const loadAndListen = async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      recognizer = speechCommands.create(
        "BROWSER_FFT",
        undefined,
        `${window.location.origin}/model/model.json`,
        `${window.location.origin}/model/metadata.json`
      );
      await recognizer.ensureModelLoaded();
      recognizer.listen((result: speechCommands.SpeechCommandRecognizerResult) => {
        const scores = Array.from(result.scores as Float32Array);
        const labels = recognizer.wordLabels();
        const topIdx = scores.indexOf(Math.max(...scores));
        setLabel(labels[topIdx]);
        return Promise.resolve();
      }, { probabilityThreshold: 0.75 });
    };
    loadAndListen();
    return () => { recognizer?.stopListening(); };
  }, []);
  return label;
};
