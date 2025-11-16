// [Binder] features/model - ChordPatternToChordsBinder.tsx
// 役割: エンジン/Transportとアプリ状態の接続（副作用）
import React from 'react';

import { PRESETS, type ChordPresetSlot as PresetSlot } from '@shared/lib/chord-presets';

import { useBarCount } from '@/entities/bar-count';
import { useChordPattern } from '@/entities/pattern';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';

// 2bars想定のデフォルト進行（slot数=8）。barsが増えた場合は繰り返しで埋める。
// PRESETS は shared/lib に分離

export const ChordPatternToChordsBinder: React.FC = () => {
  const { chordPattern } = useChordPattern();
  const { bars, chordsPerBar, applyChordPreset, setBars } = usePatternEditor();
  const { barCount } = useBarCount();

  // keep bars in sync with global barCount
  React.useEffect(() => {
    if (barCount && barCount !== bars) setBars(barCount);
  }, [barCount, bars, setBars]);

  // apply preset when chordPattern changes
  React.useEffect(() => {
    const base = PRESETS[chordPattern] || PRESETS['pattern1'];
    // extend or trim to bars*4
    const total = Math.max(1, (barCount || bars || 2) * (chordsPerBar || 4));
    const list: PresetSlot[] = Array.from({ length: total }, (_, i) => base[i % base.length]);
    applyChordPreset(list as any);
  }, [chordPattern, bars, chordsPerBar, barCount, applyChordPreset]);

  return null;
};
