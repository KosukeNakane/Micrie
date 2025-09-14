// [Model] features/drums-playback/model - drumEvents.ts
// 役割: ドラムパターンから拍時間のイベント列を生成（純関数）

export type DrumType = 'kick' | 'snare' | 'hihat';
export type DrumEvent = { time: number; type: DrumType }; // time in beats

export const getDrumEvents = (pattern: string): DrumEvent[] => {
  // 8th note grid over 2 bars (16 steps), time is in beats
  const stepDuration = 0.5; // 8th note in beats
  const steps = Array.from({ length: 16 }, (_, i) => i * stepDuration);
  const basic: DrumEvent[] = steps.map((t, i) => ({ time: t, type: (['kick', 'hihat', 'snare', 'hihat'] as const)[i % 4] }));

  if (pattern === 'hiphop') {
    return [
      { time: steps[0], type: 'kick' },
      { time: steps[1], type: 'hihat' },
      { time: steps[2], type: 'snare' },
      { time: steps[3], type: 'hihat' },
      { time: steps[4], type: 'hihat' },
      { time: steps[5], type: 'kick' },
      { time: steps[6], type: 'snare' },
      { time: steps[7], type: 'hihat' },
      { time: steps[8], type: 'kick' },
      { time: steps[9], type: 'kick' },
      { time: steps[10], type: 'snare' },
      { time: steps[11], type: 'hihat' },
      { time: steps[12], type: 'hihat' },
      { time: steps[13], type: 'kick' },
      { time: steps[14], type: 'snare' },
      { time: steps[15], type: 'hihat' },
    ];
  }
  // 他のパターンは今後拡張。未定義はbasic
  return basic;
};
