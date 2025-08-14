// ピアノサンプル音源をロードして再生するためのカスタムフック。
// 画面遷移してもサンプラーが破棄されないよう、モジュールスコープのシングルトンに変更。
// Tone.start() はユーザー操作内で別途呼んでください。

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

// --- module-scope singleton (永続) ---
let _sampler: Tone.Sampler | null = null;
let _loaded = false;

const getOrCreateSampler = () => {
  if (_sampler) return _sampler;

  _sampler = new Tone.Sampler({
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
    onload: () => {
      if (!_loaded) {
        _loaded = true;
        console.log('Piano Sampler loaded');
      }
    },
  }).toDestination();

  return _sampler;
};

export const usePianoSampler = () => {
  // 既存のAPI（refを返す）を維持
  const samplerRef = useRef<Tone.Sampler | null>(null);

  useEffect(() => {
    // マウント毎に既存のシングルトンを参照するだけ（新規生成しない）
    samplerRef.current = getOrCreateSampler();

    // ★重要: アンマウント時でも dispose/stop しない（永続させるため）
    return () => {
      // no-op
    };
  }, []);

  return samplerRef;
};