import React from 'react';
import { useChordPattern } from '@/entities/pattern/model/ChordPatternContext';
import { useChords } from '@/entities/chords';
import type { Chord, PlayType } from '@/entities/chords';
import { useBarCount } from '@/entities/bar-count/model/BarCountContext';

// 2bars想定のデフォルト進行（slot数=8）。barsが増えた場合は繰り返しで埋める。
type PresetSlot = { chord: Chord; plays?: [PlayType, PlayType] };
const PRESETS: Record<string, PresetSlot[]> = {
  pattern1: [
    { chord: { rootIndex: 5, quality: 'maj', tension: 'maj7' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: 'maj7' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 4, quality: 'maj', tension: '7' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 4, quality: 'maj', tension: '7' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'min', tension: '7' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'min', tension: '7' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'min', tension: '7' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 0, quality: 'maj', tension: '7' }, plays: ['root', 'chord'] },
  ],
  pattern2: [
    { chord: { rootIndex: 0, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 0, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'min', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'min', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
  ],
  pattern3: [
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
  ],
  pattern4: [
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 4, quality: 'min', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 4, quality: 'min', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'min', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'min', tension: '' }, plays: ['root', 'chord'] },
  ],
  pattern5: [
    { chord: { rootIndex: 9, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 0, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 0, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
  ],
  pattern6: [
    { chord: { rootIndex: 9, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 0, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 0, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
  ],
  pattern7: [
    { chord: { rootIndex: 0, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 9, quality: 'min', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 4, quality: 'min', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 4, quality: 'min', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 5, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
    { chord: { rootIndex: 7, quality: 'maj', tension: '' }, plays: ['root', 'chord'] },
  ],
};

export const ChordPatternToChordsBinder: React.FC = () => {
  const { chordPattern } = useChordPattern();
  const { bars, chordsPerBar, applyPreset, setBars } = useChords();
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
    applyPreset(list as any);
  }, [chordPattern, bars, chordsPerBar, barCount, applyPreset]);

  return null;
};
