// ピアノサンプル音源をロードして再生するためのカスタムフック。
// Tone.js の Sampler を用いて、音声ファイルをマッピング・初期化し、再利用可能な参照を提供する。

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export const usePianoSampler = () => {
  // Samplerインスタンスを保持するための参照。初期値はnull。
  const samplerRef = useRef<Tone.Sampler | null>(null);

  // コンポーネントのマウント時にSamplerを初期化
  useEffect(() => {
    // 音階と対応するサンプルファイルをTone.Samplerに登録
    samplerRef.current = new Tone.Sampler({
      urls: {
        A1: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A1.wav',
        A2: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A2.wav',
        A3: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A3.wav',
        A4: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A4.wav',
        A5: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A5.wav',
        A6: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A6.wav',
        A7: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A7.wav',
        A8: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A8.wav',
        'D#2': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds2.wav',
        'D#3': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds3.wav',
        'D#5': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds5.wav',
        'D#6': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds6.wav',
        'D#7': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds7.wav',
        'D#8': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds8.wav',
      },
      release: 1,
      // サンプラーの読み込み完了時にログ出力
      onload: () => {
        console.log('Piano Sampler loaded');
      },
    }).toDestination();
  }, []);

  // 外部からSamplerにアクセスできるよう参照を返す
  return samplerRef;
};