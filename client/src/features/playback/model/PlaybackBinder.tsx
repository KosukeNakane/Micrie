import React from 'react';
import * as Tone from 'tone';

import { useTempo } from '@/entities/tempo';
import { useSegment } from '@/entities/segment';
import { useScaleMode } from '@/entities/scale-mode';
import { useTransportStore } from '@/entities/transport';
import { useDrumPlayer } from './useDrumPlayer';
import { useMelodyPlayer } from './useMelodyPlayer';
import { majorPentatonicMap, minorPentatonicMap } from '@/shared/lib/pitchMaps';
import { extractQuantizedNotes } from '@/shared/lib/noteSegmentation';
import { useChords } from '@/entities/chords';
import { useGlobalAudio, useChannelsStore } from '@/entities/audio';
import { useChordsPlayer } from './useChordsPlayer';

// 統合 Playback Binder: melody/drum の Part 構築 + chords のスケジューリングを一元管理
export const PlaybackBinder: React.FC = () => {
  const { tempo } = useTempo();
  const engine = useGlobalAudio();
  const isLoopPlaying = useTransportStore((s) => s.isLoopPlaying);

  // Transport BPM 追随
  React.useEffect(() => { try { Tone.getTransport().bpm.value = tempo; } catch {} }, [tempo]);

  // melody/drum の Part 構築（usePlaybackController のロジックを移植）
  const { currentSegments } = useSegment();
  const { scaleMode } = useScaleMode();
  const rawMelody = React.useMemo(() => currentSegments.melody.map((seg) => (
    typeof seg.note === 'string' && /^[A-G]#?\d$/.test(seg.note) ? seg.note : 'rest'
  )), [currentSegments.melody]);

  const quantizedMelody = React.useMemo(() => (
    scaleMode === 'chromatic'
      ? extractQuantizedNotes(rawMelody, 'major', { major: {}, minor: {} })
      : extractQuantizedNotes(rawMelody, scaleMode, { major: majorPentatonicMap, minor: minorPentatonicMap })
  ), [rawMelody, scaleMode]);

  const { playMelody } = useMelodyPlayer();
  const { playDrumHit, getDrumEvents } = useDrumPlayer();

  const drumsPartRef = React.useRef<Tone.Part | null>(null);
  const melodyPartRef = React.useRef<Tone.Part | null>(null);

  // beats値を Bars:Beats:Sixteenths 文字列に変換
  const beatsToBBS = (beats: number) => {
    const totalBeats = Math.max(0, beats);
    const bars = Math.floor(totalBeats / 4);
    const remBeats = totalBeats - bars * 4;
    const beatIdx = Math.floor(remBeats);
    const sixteenth = Math.round((remBeats - beatIdx) * 4);
    return `${bars}:${beatIdx}:${sixteenth}` as const;
  };

  React.useEffect(() => {
    // 既存破棄
    drumsPartRef.current?.dispose(); drumsPartRef.current = null;
    melodyPartRef.current?.dispose(); melodyPartRef.current = null;

    // Drums Part
    try {
      const drumEvents = getDrumEvents(); // time in beats
      const drumItems = drumEvents.map(ev => [beatsToBBS(ev.time), ev.type] as [string, string]);
      const drumsPart = new Tone.Part((time, type: any) => { playDrumHit(type as any, time); }, drumItems);
      drumsPart.loop = false; drumsPart.start(0);
      drumsPartRef.current = drumsPart;
    } catch {}

    // Melody Part
    try {
      const sixteenthSec = Tone.Time('16n').toSeconds();
      const melodyItems = quantizedMelody.map(({ note, startIndex, length }) => ({
        t: beatsToBBS(startIndex * 0.25), // 16分
        n: note,
        d: length * sixteenthSec,
      }));
      const melodyPart = new Tone.Part((time, ev: any) => { playMelody(ev.n, time, ev.d); }, melodyItems.map(ev => [ev.t, ev] as [string, any]));
      melodyPart.loop = false; melodyPart.start(0);
      melodyPartRef.current = melodyPart;
    } catch {}

    return () => {
      drumsPartRef.current?.dispose(); drumsPartRef.current = null;
      melodyPartRef.current?.dispose(); melodyPartRef.current = null;
    };
  }, [quantizedMelody, getDrumEvents, playDrumHit, playMelody]);

  // chords のスケジューリング（ChordsPlaybackBinder のロジックを移植）
  const { slots, bars } = useChords();
  const chordMuted = useChannelsStore((s) => s.chordMuted);
  const { chordToNotes, playChordAt } = useChordsPlayer();
  const eventIdRef = React.useRef<number | null>(null);
  

  React.useEffect(() => {
    // isLoopPlaying が false ならスケジュール解除
    if (!isLoopPlaying) {
      if (eventIdRef.current != null) { try { Tone.getTransport().clear(eventIdRef.current as any); } catch {} eventIdRef.current = null; }
      return;
    }

    // ensure audio started
    (async () => { try { if ((Tone.getContext() as any).state !== 'running') await Tone.start(); } catch {} try { await engine.ensureStarted(); } catch {} })();

    // 再スケジュール
    if (eventIdRef.current != null) { try { Tone.getTransport().clear(eventIdRef.current as any); } catch {} eventIdRef.current = null; }
    const transport = Tone.getTransport();
    const id2 = transport.scheduleRepeat((time: number) => {
      const pos = (transport.position as unknown as string) || '0:0:0';
      const [barsStr, beatsStr, sixStr] = pos.split(':');
      const barsPos = Number(barsStr) || 0;
      const beatsPos = Number(beatsStr) || 0;
      const sixPos = Number(sixStr) || 0;
      const stepInBar = beatsPos * 2 + Math.floor(sixPos / 2); // 8n grid 0..7
      const barIndex = barsPos % Math.max(1, bars);
      const chordIndexInBar = Math.floor(stepInBar / 2); // 0..3
      const trigPos: 0 | 1 = (stepInBar % 2) as 0 | 1; // 0 or 1
      const slotIndex = barIndex * 4 + chordIndexInBar;
      const slot = slots[slotIndex];
      if (slot) {
        const type = slot.plays[trigPos];
        if (type !== 'rest') {
          try { engine.setMasterMuted(false); } catch {}
          const fullNotes = chordToNotes(slot.chord.rootIndex, slot.chord.quality, slot.chord.tension);
          const baseNotes = (type === 'root') ? [fullNotes[0]] : fullNotes;
          const playNotes = baseNotes.map(n => { try { const m = Tone.Frequency(n).toMidi(); return Tone.Frequency(m + 12, 'midi').toNote(); } catch { return n; } });
          const durSec = Tone.Time('8n').toSeconds();
          playChordAt(playNotes, time, durSec);
        }
      }
    }, '8n', 0 as any);
    eventIdRef.current = id2 as any;
    return () => {
      if (eventIdRef.current != null) { try { Tone.getTransport().clear(eventIdRef.current as any); } catch {} eventIdRef.current = null; }
    };
  }, [slots, bars, engine, isLoopPlaying, chordMuted]);

  return null;
};
