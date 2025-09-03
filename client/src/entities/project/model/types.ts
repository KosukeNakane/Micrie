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
  melodyPitch?: unknown; // 解析結果の構造に合わせて型拡張
}

export interface ProjectDocument {
  meta: ProjectMeta;
  data: ProjectData;
}

