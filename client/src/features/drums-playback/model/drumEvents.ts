// [Model] features/drums-playback/model - drumEvents.ts
// 役割: ドラムパターンから拍時間のイベント列を生成（純関数）

export type DrumType = 'kick' | 'snare' | 'hihat';
export type DrumEvent = { time: number; type: DrumType }; // time in beats
import { PATTERNS } from '../lib/patterns';

export const getDrumEvents = (pattern: string): DrumEvent[] => {
  // 8th note grid over 2 bars (16 steps), time is in beats
  const src = (PATTERNS as any)[pattern] ?? (PATTERNS as any).basic;
  return src as unknown as DrumEvent[];
};
