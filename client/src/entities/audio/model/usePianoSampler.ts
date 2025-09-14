// [Model] entities/model - usePianoSampler.ts
// 役割: ビジネスロジック/状態操作
import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

import type { ChannelKind } from '@/entities/audio';

import { useGlobalAudio } from './GlobalAudioContext';

let _samplerMelody: Tone.Sampler | null = null;
let _samplerChord: Tone.Sampler | null = null;
let _loadedMelody = false;
let _loadedChord = false;

const ensureToneContext = (ctx: AudioContext) => {
  if (Tone.getContext().rawContext !== ctx) {
    const toneCtx = new Tone.Context({ context: ctx as any });
    Tone.setContext(toneCtx);
  }
};

const createSampler = () => new Tone.Sampler({
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
    onload: () => {},
  });

export const usePianoSampler = (kind: Exclude<ChannelKind, 'drum'> = 'melody') => {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const engine = useGlobalAudio();

  useEffect(() => {
    (async () => {
      await engine.ensureStarted();
      const ctx = engine.audioContext!;
      ensureToneContext(ctx);

      // 既存のサンプラーが他Contextなら破棄
      const samplerGlobal = kind === 'melody' ? _samplerMelody : _samplerChord;
      if (samplerGlobal && (samplerGlobal.context.rawContext !== Tone.getContext().rawContext)) {
        samplerGlobal.dispose();
        if (kind === 'melody') { _samplerMelody = null; _loadedMelody = false; }
        else { _samplerChord = null; _loadedChord = false; }
      }

      // インスタンス確保
      if (kind === 'melody' && !_samplerMelody) _samplerMelody = createSampler();
      if (kind === 'chord' && !_samplerChord) _samplerChord = createSampler();
      const sampler = kind === 'melody' ? _samplerMelody! : _samplerChord!;

      // 接続先: 個別チャンネル
      try { sampler.disconnect(); } catch {}
      const input = engine.getChannelInput(kind) as unknown as AudioNode | null;
      if (input) sampler.connect(input as any);

      if (kind === 'melody' && !_loadedMelody) { _loadedMelody = true; console.log('Piano Sampler (melody) ready'); }
      if (kind === 'chord' && !_loadedChord) { _loadedChord = true; console.log('Piano Sampler (chord) ready'); }

      samplerRef.current = sampler;
    })();
    return () => {};
  }, [engine, kind]);

  return samplerRef;
};
