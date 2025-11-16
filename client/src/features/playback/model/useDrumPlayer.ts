// [Model] features/model - useDrumPlayer.ts
// 役割: ドラムの発音を担当（パターン生成は別モジュールへ分離）
import { useCallback, useMemo } from 'react';
import * as Tone from 'tone';

import { useGlobalAudio } from '@entities/audio';
import { useDrumPattern } from '@entities/pattern';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';
import { useTempo } from '@entities/tempo';

import { useDrumPlayers } from '@/entities/audio/model/useDrumSampler';
import { getDrumEvents, type DrumEvent } from '@/features/drums-playback/model/drumEvents';

type DrumType = 'kick' | 'snare' | 'hihat';

export const useDrumPlayer = () => {
  const { drumPattern } = useDrumPattern();
  const { rhythmSegments } = usePatternEditor();
  const { tempo } = useTempo();
  const engine = useGlobalAudio();
  const { trigger } = useDrumPlayers();

  const eventsForCurrent = useMemo<DrumEvent[]>(() => {
    // Prefer rhythmSegments if available; fallback to pattern library
    const stepDur = 0.5; // 8th note
    const events: DrumEvent[] = [];
    let recognized = 0;
    for (let i = 0; i < 16 && i < (rhythmSegments?.length ?? 0); i++) {
      const label = (rhythmSegments[i]?.label ?? '') as any;
      if (label === 'kick' || label === 'snare' || label === 'hihat') {
        recognized++;
        events.push({ time: i * stepDur, type: label });
      }
    }
    if (recognized > 0) return events;
    return getDrumEvents(drumPattern);
  }, [drumPattern, rhythmSegments]);

  // 単発ヒットをTransportのコールバックtimeに同期して鳴らす
  const playDrumHit = useCallback((type: DrumType, time: number) => {
    try { trigger(type, time); } catch { }
  }, [trigger]);

  // 現在選択のパターンイベントを返す（timeは拍単位）
  const getDrumEventsCb = useCallback(() => eventsForCurrent, [eventsForCurrent]);

  // 互換: 既存のループ再生（今後は未使用推奨）
  const playDrumLoop = (startTime: number) => {
    const events = eventsForCurrent;
    const beatDuration = 60 / tempo;
    const base = Tone.now();
    const ctxNow = engine.audioContext?.currentTime ?? base;
    const delta = Math.max(0, startTime - ctxNow);
    events.forEach(({ type, time }) => {
      const when = base + delta + time * beatDuration;
      try { trigger(type, when); } catch { }
    });
  };

  return { playDrumLoop, playDrumHit, getDrumEvents: getDrumEventsCb };
};
