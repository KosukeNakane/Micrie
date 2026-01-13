// [Lib] shared/lib - noteMapping.ts
// 役割: メロディノートのスケール変換・オクターブシフト（純関数）

import { scalePitchMaps } from '@shared/lib/pitchMaps';

export type ScaleMode = 'major' | 'minor' | 'chromatic';

export const mapNoteToScale = (note: string, scaleMode: ScaleMode): string => {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return note;
  const [, base, octave] = match;
  const mappedBase = scalePitchMaps[scaleMode]?.[base] || base;
  return `${mappedBase}${octave}`;
};

export const transposeUpTwoOctaves = (note: string): string => {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return note;
  const [, pitch, octave] = match;
  const newOctave = parseInt(octave) + 3; // 既存実装の挙動をそのまま維持
  return `${pitch}${newOctave}`;
};
