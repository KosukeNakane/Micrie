// [Binder] features/pattern-select - DrumPatternToRhythmSegmentsBinder.tsx
// 役割: DrumPattern の選択内容を rhythmSegments に反映（編集前提の初期化）
import React from 'react';

import { useDrumPattern } from '@/entities/pattern';
import { useSegment } from '@/entities/segment';
import { PATTERNS } from '@/features/drums-playback/lib/patterns';

const STEP_BEAT = 0.5; // 8th notes in beats

export const DrumPatternToRhythmSegmentsBinder: React.FC = () => {
  const { drumPattern } = useDrumPattern();
  const { setRhythmSegments } = useSegment();

  React.useEffect(() => {
    // パターン変更時に必ず rhythmSegments を上書きして同期
    const src = (PATTERNS as any)[drumPattern] as readonly { time: number; type: 'kick'|'snare'|'hihat' }[];
    const next = Array.from({ length: 16 }, (_, i) => ({
      label: '' as string,
      start: i * STEP_BEAT,
      end: (i + 1) * STEP_BEAT,
    }));
    src.forEach(ev => {
      const idx = Math.round(ev.time / STEP_BEAT);
      if (idx >= 0 && idx < 16) next[idx].label = ev.type;
    });
    try { setRhythmSegments(next as any); } catch {}
  }, [drumPattern, setRhythmSegments]);

  return null;
};
