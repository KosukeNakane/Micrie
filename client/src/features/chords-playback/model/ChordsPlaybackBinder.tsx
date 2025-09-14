import React from 'react';
import * as Tone from 'tone';
import { useChords } from '@/entities/chords';
import { useBarCount } from '@/entities/bar-count';
import { useGlobalAudio } from '@/entities/audio/model/GlobalAudioContext';
import { useChannelsStore } from '@/entities/audio/model/useChannelsStore';
import { useTransportStore } from '@/entities/transport/model/useTransportStore';
import { usePianoSampler } from '@/entities/audio/model/usePianoSampler';

// 同じサウンドフォントを利用するため、エンジン側と同じ宣言名を参照
declare const _tone_0000_Aspirin_sf2_file: any;

const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

function chordToNotes(rootIndex: number, quality: 'maj'|'min'|'dim'|'aug', tension: ''|'maj7'|'7'|'6'|'9'|'11'|'13'): string[] {
  const rootName = `${NOTES[rootIndex]}3`;
  let rootMidi = 60;
  try { rootMidi = Tone.Frequency(rootName).toMidi(); } catch {}
  const intervals = quality === 'min' ? [0,3,7] : quality === 'dim' ? [0,3,6] : quality === 'aug' ? [0,4,8] : [0,4,7];
  const ext = tension === 'maj7' ? 11 : tension === '7' ? 10 : tension === '6' ? 9 : tension === '9' ? 14 : tension === '11' ? 17 : tension === '13' ? 21 : null;
  const mids = intervals.map(iv => rootMidi + iv);
  if (ext !== null) mids.push(rootMidi + ext);
  return mids.map(m => (m > 84 ? Tone.Frequency(m-12,'midi').toNote() : Tone.Frequency(m,'midi').toNote()));
}

export const ChordsPlaybackBinder: React.FC = () => {
  const { slots, bars, setBars } = useChords();
  const { barCount } = useBarCount();
  const engine = useGlobalAudio();
  const eventIdRef = React.useRef<number | null>(null);
  const chordMuted = useChannelsStore((s) => s.chordMuted);
  const isLoopPlaying = useTransportStore((s) => s.isLoopPlaying);
  const chordSamplerRef = usePianoSampler('chord');

  // 直前の挙動に戻すため、loopEnd 同期は行わない

  React.useEffect(() => {
    // keep chords store bars in sync with global bar count
    if (barCount && barCount !== bars) setBars(barCount);
  }, [barCount, bars, setBars]);

  React.useEffect(() => {
    // ループ停止時はスケジュールを必ず解除
    if (!isLoopPlaying) {
      if (eventIdRef.current != null) {
        try { Tone.getTransport().clear(eventIdRef.current as any); } catch {}
        eventIdRef.current = null;
      }
      return;
    }
    // ensure audio is ready
    (async () => {
      try { if ((Tone.getContext() as any).state !== 'running') await Tone.start(); } catch {}
      try { await engine.ensureStarted(); } catch {}
      // Samplerは usePianoSampler('chord') でエンジンのchordチャンネルに接続済み
    })();
    // (re)schedule
    const totalSteps = Math.max(1, bars * 8); // 8 triggers per bar
    if (import.meta.env.DEV) console.log('[ChordsBinder] (re)build schedule', { bars, totalSteps, slotsLen: slots.length, chordMuted });
    if (eventIdRef.current != null) {
      try { Tone.getTransport().clear(eventIdRef.current as any); } catch {}
      eventIdRef.current = null;
    }
    const transport = Tone.getTransport();
    const id2 = transport.scheduleRepeat(async (time: number) => {
      // 直前のロジック: Transport.position からB:B:Sを取得
      const pos = (transport.position as unknown as string) || '0:0:0';
      const [barsStr, beatsStr, sixStr] = pos.split(':');
      const barsPos = Number(barsStr) || 0;
      const beatsPos = Number(beatsStr) || 0;
      const sixPos = Number(sixStr) || 0; // 0..3 (16th)
      const stepInBar = beatsPos * 2 + Math.floor(sixPos / 2); // 8n grid 0..7
      const barIndex = barsPos % Math.max(1, bars);
      const chordIndexInBar = Math.floor(stepInBar / 2); // 0..3
      const trigPos: 0 | 1 = (stepInBar % 2) as 0 | 1; // 0 or 1
      const slotIndex = barIndex * 4 + chordIndexInBar;
      const slot = slots[slotIndex];
      if (slot) {
        const type = slot.plays[trigPos];
        if (import.meta.env.DEV) console.log('[ChordsBinder] tick', { barsPos, beatsPos, sixPos, barIndex, stepInBar, chordIndexInBar, trigPos, slotIndex, type, chordMuted });
        if (type !== 'rest') {
          try { await engine.setMasterMuted(false); } catch {}
          const notes = chordToNotes(slot.chord.rootIndex, slot.chord.quality, slot.chord.tension);
          const playNotesBase = (type === 'root') ? [notes[0]] : notes;
          // 全体を1オクターブ上げる（+12 semitones）
          const playNotes = playNotesBase.map(n => {
            try { const m = Tone.Frequency(n).toMidi(); return Tone.Frequency(m + 12, 'midi').toNote(); } catch { return n; }
          });
          if (import.meta.env.DEV) console.log('[ChordsBinder] play (Sampler, +12)', { type, notes: playNotes });
          try {
            // Tone.Sampler は配列再生非対応のため各ノート個別に発音
            const durSec = Tone.Time('8n').toSeconds();
            playNotes.forEach(n => chordSamplerRef.current?.triggerAttackRelease(n, durSec, time));
          } catch {}
        }
      }
    }, '8n', 0 as any);
    eventIdRef.current = id2 as any;
    return () => {
      if (eventIdRef.current != null) {
        try { Tone.getTransport().clear(eventIdRef.current as any); } catch {}
        eventIdRef.current = null;
      }
      // サンプラはグローバルに保持されるためdisposeしない
    };
  }, [slots, bars, engine, isLoopPlaying]);

  return null;
};
