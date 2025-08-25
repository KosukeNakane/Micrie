import { useEffect, useRef, useMemo } from 'react';
import * as Tone from 'tone';

import { useDrumPattern } from '@entities/pattern/model/DrumPatternContext';
import { useTempo } from '@entities/tempo/model/TempoContext';

type DrumType = 'kick' | 'snare' | 'hihat';
type DrumEvent = { time: number; type: DrumType };

export const useDrumPlayer = () => {
  const { drumPattern } = useDrumPattern();
  const { tempo } = useTempo();
  const buffersRef = useRef<{ [key in DrumType]?: AudioBuffer }>({});

  const getDrumPatterns = (): { [key: string]: DrumEvent[] } => {
    const stepDuration = 0.5; // 8th note in beats
    const steps = Array.from({ length: 16 }, (_, i) => i * stepDuration);
    return {
      basic: steps.map((t, i) => ({ time: t, type: (['kick','hihat','snare','hihat'] as const)[i % 4] })),
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
      ],
    };
  };

  const drumPatterns = useMemo(() => getDrumPatterns(), [tempo]);

  useEffect(() => {
    const drumFiles: { [key in DrumType]: string } = {
      kick: '/samples/PublicSamples/Drums/kick135.wav',
      hihat: '/samples/PublicSamples/Drums/Half_Open_Hi-Hat.wav',
      snare: '/samples/PublicSamples/Drums/Snare14.wav'
    };
    const loadAll = async () => {
      const ctx = Tone.getContext().rawContext;
      const entries = await Promise.all((Object.entries(drumFiles) as [DrumType, string][]) .map(async ([type, url]) => {
        const res = await fetch(url); const arrayBuffer = await res.arrayBuffer(); const audioBuffer = await ctx.decodeAudioData(arrayBuffer); return [type, audioBuffer] as const; }));
      buffersRef.current = Object.fromEntries(entries);
    };
    loadAll();
  }, []);

  const playDrumLoop = (startTime: number) => {
    const pattern = drumPatterns[drumPattern] || drumPatterns['basic'];
    const ctx = Tone.getContext().rawContext; const beatDuration = 60 / tempo;
    pattern.forEach(({ type, time }) => {
      const buffer = buffersRef.current[type]; if (!buffer) return;
      const source = ctx.createBufferSource(); source.buffer = buffer; source.connect(ctx.destination); source.start(startTime + time * beatDuration);
    });
  };

  return { playDrumLoop };
};

