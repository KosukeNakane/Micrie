// [Model] entities/model - types.ts
// 役割: アレンジメントスナップショットおよびスロットの型定義
import type { ChordSlot } from '@/entities/chords';
import type { Segment } from '@/entities/segment';
import type { ChordPattern, DrumPattern } from '@/entities/pattern';

export interface ArrangementChordsState {
  bars: number;
  chordsPerBar: number;
  slots: ChordSlot[];
}

export interface ArrangementSnapshot {
  chordPattern: ChordPattern;
  chords: ArrangementChordsState;
  drumPattern: DrumPattern;
  melody: {
    barCount: number;
    segments: Segment[];
  };
  rhythmSegments: Segment[];
}

export interface ArrangementSlot {
  id: string;
  name: string;
  savedAt: number;
  snapshot: ArrangementSnapshot;
}

export const ARRANGEMENT_SLOT_COUNT = 6;
