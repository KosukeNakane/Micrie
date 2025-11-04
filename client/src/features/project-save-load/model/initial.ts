// [Model] features/model - initial.ts
// 役割: ビジネスロジック/状態操作
import { ARRANGEMENT_SLOT_COUNT } from '@/entities/arrangement';
import type { ProjectData, MelodyPitchItem } from '@/entities/project';

// Returns the app's initial, untouched project data
export function getInitialProjectData(): ProjectData {
  return {
    tempo: 90,
    chordPattern: 'pattern1', // Cool City
    drumPattern: 'basic',     // Basic
    volume: { master: 100 },
    scale: { root: 'C', mode: 'major' },
    effects: { CRUSH: 0, COMB: 0, HICUT: 0, LOWCUT: 0, REVERB: 0, DIRTY: 0 },
    effectsHold: { holdAll: false, holdByKey: {} },
    channelsMuted: { melody: false, chord: false, drum: false, sampler: false },
    // 初期値はすべて休符（2小節 x 4拍 = 8）: note のみ保持
    melodyPitch: Array.from({ length: 8 }, (): MelodyPitchItem => ({ note: 'rest' })),
    arrangements: Array.from({ length: ARRANGEMENT_SLOT_COUNT }, () => null),
  } as ProjectData;
}
