// [Lib] shared/lib - chord-presets.ts
// 役割: コード進行のプリセット定義（構造体と定数）

export type ChordPresetSlot = {
  chord: {
    rootIndex: number;
    quality: 'maj' | 'min' | 'dim' | 'aug';
    tension: '' | 'maj7' | '7' | '6' | '9' | '11' | '13';
  };
  plays?: ['root' | 'chord', 'root' | 'chord'];
};

export const PRESETS: Record<string, ChordPresetSlot[]> = {
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

