// [Model] entities/model - types.ts
// 役割: ビジネスロジック/状態操作
export interface ProjectMeta {
  id: string;
  name: string;
  ownerUid: string;
  createdAt: number;
  updatedAt: number;
  schemaVersion: 1;
  appVersion?: string;
}

export type EffectKey = "CRUSH" | "COMB" | "HICUT" | "LOWCUT" | "REVERB" | "DIRTY";

export interface ProjectSegment {
  label?: string;
  start: number;
  end: number;
  hz?: number;
  note?: string;
  confidence?: number;
  rms?: number;
  confidence_rms?: number;
  [key: string]: unknown;
}

export interface ProjectArrangementSnapshot {
  chordPattern: string;
  drumPattern: string;
  chords: {
    bars: number;
    chordsPerBar: number;
    slots: Array<{
      chord: { rootIndex: number; quality: 'maj' | 'min' | 'dim' | 'aug'; tension: '' | 'maj7' | '7' | '6' | '9' | '11' | '13' };
      plays: ['chord' | 'root' | 'rest', 'chord' | 'root' | 'rest'];
    }>;
  };
  melody: {
    barCount: number;
    segments: ProjectSegment[];
  };
  rhythmSegments: ProjectSegment[];
}

export interface ProjectArrangementPattern {
  id: string;
  name: string;
  savedAt: number;
  snapshot: ProjectArrangementSnapshot;
}

export interface ProjectData {
  tempo: number;
  chordPattern?: string;
  drumPattern?: string;
  chordsProgression?: {
    bars: number;
    chordsPerBar: number;
    slots: Array<{
      chord: { rootIndex: number; quality: 'maj'|'min'|'dim'|'aug'; tension: ''|'maj7'|'7'|'6'|'9'|'11'|'13' };
      plays: ['chord'|'root'|'rest', 'chord'|'root'|'rest'];
    }>;
  };
  volume?: {
    master?: number;
    melody?: number;
    chord?: number;
    drum?: number;
    sampler?: number;
  };
  scale?: {
    root: string;
    mode: string;
  };
  effects: Record<EffectKey, number>;
  effectsHold: { holdAll: boolean; holdByKey: Partial<Record<EffectKey, boolean>> };
  channelsMuted: { melody: boolean; chord: boolean; drum: boolean; sampler: boolean };
  audio?: { audioUrl: string | null; waveform?: number[] | null };
  melodyPitch?: MelodyPitchItem[]; // メロディーピッチ（各グリッドの音名のみ保存）。初期値は休符。
  arrangements?: Array<ProjectArrangementPattern | null>;
  savedPatterns?: Array<{
    id: string;
    name: string;
    bars: number;
    chordsPerBar: number;
    chordSlots: Array<{
      chord: { rootIndex: number; quality: 'maj' | 'min' | 'dim' | 'aug'; tension: '' | 'maj7' | '7' | '6' | '9' | '11' | '13' };
      plays: ['chord' | 'root' | 'rest', 'chord' | 'root' | 'rest'];
    }>;
    melodySegments: ProjectSegment[];
    rhythmSegments: ProjectSegment[];
  } | null>;
  lastEditingPatternId?: string | null;
}

export interface ProjectDocument {
  meta: ProjectMeta;
  data: ProjectData;
}

export interface MelodyPitchItem {
  note: string; // 'C4' など、休符は 'rest'。保存はこれのみ。
}
