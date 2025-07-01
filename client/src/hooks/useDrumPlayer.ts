// ドラムパターンのロードと再生を管理するカスタムフック。
// 選択されたドラムパターンに応じて、適切なタイミングでサンプルを再生する。

import { useEffect, useRef, useMemo } from 'react';
import * as Tone from 'tone';
import { useDrumPattern } from '../context/DrumPatternContext';
import { useTempo } from '../context/TempoContext';

type DrumType = 'kick' | 'snare' | 'hihat';

type DrumEvent = {
  time: number; // relative time in beats
  type: DrumType;
};

export const useDrumPlayer = () => {
  const { drumPattern } = useDrumPattern();
  const { tempo } = useTempo();

  // 各ドラムタイプ（kick, snare, hihat）に対応するAudioBufferを保持
  const buffersRef = useRef<{ [key in DrumType]?: AudioBuffer }>({});

  // 各ドラムパターンのステップシーケンスを生成する関数
  const getDrumPatterns = (): { [key: string]: DrumEvent[] } => {
    const stepDuration = 0.5; // 8th note duration in beats
    const steps = Array.from({ length: 16 }, (_, i) => i * stepDuration);

    return {
      basic: steps.map((stepTime, i) => {
        const sequence = ['kick', 'hihat', 'snare', 'hihat'] as const;
        const type = sequence[i % 4];
        return { time: stepTime, type } as DrumEvent;
      }),
      hiphop: [
        { time: steps[0], type: 'kick' },
        { time: steps[1], type: 'hihat' },
        { time: steps[2], type: 'snare' },
        { time: steps[3], type: 'hihat' },
        { time: steps[4], type: 'hihat' },
        { time: steps[5], type: 'kick' },
        { time: steps[6], type: 'snare' },
        { time: steps[7], type: 'hihat' },
        { time: steps[8], type: 'kick' },
        { time: steps[9], type: 'kick' },
        { time: steps[10], type: 'snare' },
        { time: steps[11], type: 'hihat' },
        { time: steps[12], type: 'hihat' },
        { time: steps[13], type: 'kick' },
        { time: steps[14], type: 'snare' },
        { time: steps[15], type: 'hihat' },
      ]
    };
  };

  // Compute drum patterns based on current tempo
  const drumPatterns = useMemo(() => getDrumPatterns(), [tempo]);

  // ドラムサンプル音源（kick/snare/hihat）をプリロード
  useEffect(() => {
    const drumFiles: { [key in DrumType]: string } = {
      kick: '/samples/PublicSamples/Drums/kick135.wav',
      hihat:'/samples/PublicSamples/Drums/Half_Open_Hi-Hat.wav',
      snare: '/samples/PublicSamples/Drums/Snare14.wav'
    };

    const loadAll = async () => {
      const ctx = Tone.getContext().rawContext;
      const entries = await Promise.all(
        (Object.entries(drumFiles) as [DrumType, string][]).map(
          async ([type, url]) => {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            return [type, audioBuffer] as const;
          }
        )
      );
      buffersRef.current = Object.fromEntries(entries);
    };

    loadAll();
  }, []);

  // 現在選択されているドラムパターンを再生する関数
  // 各ステップのタイミングでAudioBufferを生成し、Tone.jsの再生コンテキストに流す
  const playDrumLoop = (startTime: number) => {
    const pattern = drumPatterns[drumPattern] || drumPatterns['basic'];
    const ctx = Tone.getContext().rawContext;
    const beatDuration = 60 / tempo;

    pattern.forEach(({ type, time }) => {
      const buffer = buffersRef.current[type];
      if (!buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(startTime + time * beatDuration);
    });
  };

  return { playDrumLoop };
};