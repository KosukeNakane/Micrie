import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Tone from 'tone';

import { useSegment } from '@entities/segment/model/SegmentContext';
import { useTempo } from '@entities/tempo/model/TempoContext';

// 旧 useDrumLoopScheduler のロジックを Binder に移行
// 注意: 旧実装同様、isLooping は常に false のため実質スケジュールは走りません（挙動不変）
export const DrumsPlaybackBinder: React.FC = () => {
  const { tempo } = useTempo();
  const { loopMode, currentSegments } = useSegment();
  const [isLooping] = useState(false);
  const isLoopingRef = useRef(false);

  const synthRef = useRef<{
    kick: Tone.MembraneSynth;
    snare: Tone.NoiseSynth;
    hihat: Tone.NoiseSynth;
  } | null>(null);

  const scheduleIdRef = useRef<number | null>(null);

  const normalizedSteps = useMemo(() => {
    if (!currentSegments || typeof currentSegments !== 'object') return [] as string[];
    const selectedSegments = loopMode === 'rhythm' ? currentSegments.rhythm : (loopMode === 'melody' ? [] : currentSegments.rhythm);
    return selectedSegments
      .filter((step): step is { label: string; start: number; end: number } =>
        typeof step.label === 'string' && typeof step.start === 'number' && typeof step.end === 'number')
      .map(step => step.label.trim().toLowerCase());
  }, [currentSegments, loopMode]);

  const { stepDuration } = useMemo(() => ({ stepDuration: 60 / tempo / 2 }), [tempo]);

  useEffect(() => { Tone.getTransport().bpm.value = tempo; }, [tempo]);

  useEffect(() => {
    isLoopingRef.current = isLooping;
    if (!isLooping || !synthRef.current) return;
    if (!normalizedSteps.some(step => ['kick', 'snare', 'hihat'].includes(step))) return;

    const synth = synthRef.current;
    let index = 0; const totalSteps = normalizedSteps.length;
    const id = Tone.getTransport().scheduleRepeat((time) => {
      if (!isLoopingRef.current) return;
      const step = normalizedSteps[index % totalSteps];
      if (step === 'kick') synth.kick.triggerAttackRelease('C1', '8n', time);
      else if (step === 'snare') synth.snare.triggerAttackRelease('8n', time);
      else if (step === 'hihat') synth.hihat.triggerAttackRelease('16n', time);
      index++;
    }, stepDuration);
    scheduleIdRef.current = id;
    return () => { if (scheduleIdRef.current !== null) { Tone.getTransport().clear(scheduleIdRef.current); scheduleIdRef.current = null; } };
  }, [isLooping, normalizedSteps, stepDuration]);

  return null;
};
