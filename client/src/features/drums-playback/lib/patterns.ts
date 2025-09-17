// [Lib] features/drums-playback/lib - patterns.ts
// 役割: ドラムパターン（配列のみ）

// 2小節・16ステップ（8分刻み）: time は拍単位（0.5刻み）

export const BASIC = [
  { time: 0.0, type: 'kick' },
  { time: 0.5, type: 'hihat' },
  { time: 1.0, type: 'snare' },
  { time: 1.5, type: 'hihat' },
  { time: 2.0, type: 'kick' },
  { time: 2.5, type: 'hihat' },
  { time: 3.0, type: 'snare' },
  { time: 3.5, type: 'hihat' },
  { time: 4.0, type: 'kick' },
  { time: 4.5, type: 'hihat' },
  { time: 5.0, type: 'snare' },
  { time: 5.5, type: 'hihat' },
  { time: 6.0, type: 'kick' },
  { time: 6.5, type: 'hihat' },
  { time: 7.0, type: 'snare' },
  { time: 7.5, type: 'hihat' },
] as const;

export const HIPHOP = [
  { time: 0.0, type: 'kick' },
  { time: 0.5, type: 'hihat' },
  { time: 1.0, type: 'snare' },
  { time: 1.5, type: 'hihat' },
  { time: 2.0, type: 'hihat' },
  { time: 2.5, type: 'kick' },
  { time: 3.0, type: 'snare' },
  { time: 3.5, type: 'hihat' },
  { time: 4.0, type: 'kick' },
  { time: 4.5, type: 'kick' },
  { time: 5.0, type: 'snare' },
  { time: 5.5, type: 'hihat' },
  { time: 6.0, type: 'hihat' },
  { time: 6.5, type: 'kick' },
  { time: 7.0, type: 'snare' },
  { time: 7.5, type: 'hihat' },
] as const;

