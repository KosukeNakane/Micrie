// [Model] features/model - arrangementPlaybackBuilder.ts
// 役割: Saved Pattern から再生用タイムラインを構築
import * as Tone from 'tone';

import type { Pattern } from '@/entities/pattern/model/patternTypes';

const ORIGINAL_BAR_DURATION_SECONDS = 2; // 旧セグメントは 1 bar = 2s を前提に作成されている

export type ArrangementPlaybackEvent =
  | {
      type: 'melody';
      start: number;
      duration: number;
      note: string;
      velocity: number;
    }
  | {
      type: 'drum';
      start: number;
      duration: number;
      label: 'kick' | 'snare' | 'hihat';
      velocity: number;
    }
  | {
      type: 'chord';
      start: number;
      duration: number;
      notes: string[];
      velocity: number;
    };

export type ArrangementPlaybackTimeline = {
  events: ArrangementPlaybackEvent[];
  length: number;
};

const CHORD_QUALITY_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
};

const CHORD_TENSION_INTERVALS: Record<string, number[]> = {
  '': [],
  maj7: [11],
  '7': [10],
  '6': [9],
  '9': [14],
  '11': [17],
  '13': [21],
};

const DRUM_DEFAULTS: Record<'kick' | 'snare' | 'hihat', { frequency: number; duration: number }> = {
  kick: { frequency: 60, duration: 0.35 },
  snare: { frequency: 180, duration: 0.28 },
  hihat: { frequency: 420, duration: 0.15 },
};

const clampDuration = (value: number, fallback = 0.1) => {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
};

const makeChordNotes = (
  rootIndex: number,
  quality: string,
  tension: string,
  octave = 4,
): string[] => {
  const baseIntervals = CHORD_QUALITY_INTERVALS[quality] ?? CHORD_QUALITY_INTERVALS.maj;
  const tensionIntervals = CHORD_TENSION_INTERVALS[tension] ?? [];
  const intervals = Array.from(new Set([...baseIntervals, ...tensionIntervals])).sort((a, b) => a - b);
  return intervals.map((interval) => {
    const midi = octave * 12 + rootIndex + interval;
    return Tone.Frequency(midi, 'midi').toNote();
  });
};

const scaleTime = (value: number, factor: number) => value * factor;

export const buildArrangementPlayback = (
  pattern: Pattern,
  { tempo }: { tempo: number },
): ArrangementPlaybackTimeline => {
  const events: ArrangementPlaybackEvent[] = [];
  const barDuration = (60 / Math.max(tempo, 1)) * 4;
  const scaleFactor = barDuration / ORIGINAL_BAR_DURATION_SECONDS;

  let maxEnd = 0;

  // Melody
  pattern.melodySegments.forEach((segment) => {
    const note = typeof segment.note === 'string' ? segment.note : null;
    if (!note || note.toLowerCase() === 'rest') return;
    const start = scaleTime(segment.start ?? 0, scaleFactor);
    const end = scaleTime(segment.end ?? segment.start ?? 0, scaleFactor);
    const duration = clampDuration(end - start);
    events.push({
      type: 'melody',
      start,
      duration,
      note,
      velocity: 0.85,
    });
    maxEnd = Math.max(maxEnd, start + duration);
  });

  // Drums
  pattern.rhythmSegments.forEach((segment) => {
    const label = typeof segment.label === 'string' ? segment.label : '';
    if (label !== 'kick' && label !== 'snare' && label !== 'hihat') return;
    const config = DRUM_DEFAULTS[label];
    const start = scaleTime(segment.start ?? 0, scaleFactor);
    const duration = clampDuration(scaleTime((segment.end ?? segment.start ?? 0) - (segment.start ?? 0), scaleFactor), config.duration);
    events.push({
      type: 'drum',
      start,
      duration,
      label,
      velocity: 1,
    });
    maxEnd = Math.max(maxEnd, start + duration);
  });

  // Chords
  const slots = pattern.chordSlots ?? [];
  const chordsPerBar = Math.max(pattern.chordsPerBar ?? 4, 1);
  const bars = Math.max(pattern.bars ?? 1, 1);
  const slotDuration = barDuration / chordsPerBar;

  slots.forEach((slot, index) => {
    const barIndex = Math.floor(index / chordsPerBar);
    const withinBarIndex = index % chordsPerBar;
    const baseStart = barIndex * barDuration + withinBarIndex * slotDuration;
    const plays = Array.isArray(slot.plays) ? slot.plays : ['chord', 'rest'];
    const subDuration = slotDuration / plays.length;
    plays.forEach((playType, pos) => {
      if (playType === 'rest') return;
      const start = baseStart + pos * subDuration;
      const notes = makeChordNotes(
        slot.chord?.rootIndex ?? 0,
        slot.chord?.quality ?? 'maj',
        slot.chord?.tension ?? '',
      );
      events.push({
        type: 'chord',
        start,
        duration: clampDuration(subDuration),
        notes,
        velocity: playType === 'root' ? 0.7 : 0.9,
      });
      maxEnd = Math.max(maxEnd, start + subDuration);
    });
  });

  const totalLength = Math.max(maxEnd, bars * barDuration);
  events.sort((a, b) => a.start - b.start);

  return { events, length: totalLength };
};
