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

export interface ProjectData {
  tempo: number;
  chordPattern?: string;
  drumPattern?: string;
  volume?: {
    master?: number;
    melody?: number;
    chord?: number;
    drum?: number;
  };
  scale?: {
    root: string;
    mode: string;
  };
  effects: Record<EffectKey, number>;
  effectsHold: { holdAll: boolean; holdByKey: Partial<Record<EffectKey, boolean>> };
  channelsMuted: { melody: boolean; chord: boolean; drum: boolean };
  audio?: { audioUrl: string | null; waveform?: number[] | null };
  melodyPitch?: MelodyPitchItem[]; // メロディーピッチ（各グリッドの音名のみ保存）。初期値は休符。
}

export interface ProjectDocument {
  meta: ProjectMeta;
  data: ProjectData;
}

export interface MelodyPitchItem {
  note: string; // 'C4' など、休符は 'rest'。保存はこれのみ。
}
