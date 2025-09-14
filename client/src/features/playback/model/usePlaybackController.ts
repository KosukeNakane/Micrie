// [Model] features/model - usePlaybackController.ts
// 役割: ビジネスロジック/状態操作
import { useEffect, useMemo, useRef } from 'react';
import * as Tone from 'tone';

import { GlobalAudioEngine } from '@entities/audio/lib/GlobalAudioEngine';
import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';
import { useSegment } from '@entities/segment/model/SegmentContext';
import { useTempo } from '@entities/tempo/model/TempoContext';
import { useTransportStore } from '@entities/transport/model/useTransportStore';
import { useDrumPlayer } from './useDrumPlayer';
import { useMelodyPlayer } from './useMelodyPlayer';
import { extractQuantizedNotes } from '@shared/lib/noteSegmentation';
import { majorPentatonicMap, minorPentatonicMap } from '@shared/lib/pitchMaps';

const DEBUG = false;

export const usePlaybackController = () => {
  const isLoopPlaying = useTransportStore((s) => s.isLoopPlaying);
  const setLoopPlaying = useTransportStore((s) => s.setLoopPlaying);

  const { tempo } = useTempo();
  const { currentSegments } = useSegment();
  const { scaleMode } = useScaleMode();

  const rawMelody = useMemo(() => currentSegments.melody.map((seg) => (
    typeof seg.note === 'string' && /^[A-G]#?\d$/.test(seg.note) ? seg.note : 'rest'
  )), [currentSegments.melody]);

  const quantizedMelody = useMemo(() => (
    scaleMode === 'chromatic'
      ? extractQuantizedNotes(rawMelody, 'major', { major: {}, minor: {} })
      : extractQuantizedNotes(rawMelody, scaleMode, { major: majorPentatonicMap, minor: minorPentatonicMap })
  ), [rawMelody, scaleMode]);

  useEffect(() => { if (DEBUG) console.log('🎹 quantizedMelody:', quantizedMelody); }, [quantizedMelody]);

  // 基本単位（楽譜時間 -> 秒 は必要時のみ）
  const chordDurSec = Tone.Time('8n').toSeconds(); // 0.5 beat
  const sixteenthSec = Tone.Time('16n').toSeconds();

  // chords playback is handled by ChordsPlaybackBinder (from ChordsStore)
  const { playMelody } = useMelodyPlayer();
  const { playDrumHit, getDrumEvents } = useDrumPlayer();

  const drumsPartRef = useRef<Tone.Part | null>(null);
  const chordsPartRef = useRef<Tone.Part | null>(null);
  const melodyPartRef = useRef<Tone.Part | null>(null);

  // beats値を Bars:Beats:Sixteenths 文字列に変換
  const beatsToBBS = (beats: number) => {
    const totalBeats = Math.max(0, beats);
    const bars = Math.floor(totalBeats / 4);
    const remBeats = totalBeats - bars * 4;
    const beatIdx = Math.floor(remBeats);
    const sixteenth = Math.round((remBeats - beatIdx) * 4);
    return `${bars}:${beatIdx}:${sixteenth}` as const;
  };

  // Parts 構築は統合 PlaybackBinder に移行
  useEffect(() => {
    drumsPartRef.current?.dispose(); drumsPartRef.current = null;
    chordsPartRef.current?.dispose(); chordsPartRef.current = null;
    melodyPartRef.current?.dispose(); melodyPartRef.current = null;
    return () => {
      drumsPartRef.current?.dispose(); drumsPartRef.current = null;
      chordsPartRef.current?.dispose(); chordsPartRef.current = null;
      melodyPartRef.current?.dispose(); melodyPartRef.current = null;
    };
  }, [quantizedMelody, getDrumEvents, playDrumHit, playMelody]);

  const loopPlay = async () => {
    if (isLoopPlaying) return;
    if (Tone.getContext().state !== 'running') await Tone.start();
    Tone.getTransport().bpm.value = tempo;
    await GlobalAudioEngine.instance.ensureStarted();
    await GlobalAudioEngine.instance.setMasterMuted(false);
    // ループ設定（Transport に任せる）
    Tone.getTransport().loop = true;
    Tone.getTransport().loopEnd = '2m';
    Tone.getTransport().start();
    setLoopPlaying(true);
  };

  const stop = () => {
    // 一時停止（位置保持）
    GlobalAudioEngine.instance.setMasterMuted(true);
    Tone.getTransport().pause();
    setLoopPlaying(false);
  };

  const reset = () => {
    // 停止（位置リセット0:0:0）
    GlobalAudioEngine.instance.setMasterMuted(true);
    Tone.getTransport().stop();
    setLoopPlaying(false);
  };

  useEffect(() => {
    const actuallyPlaying = Tone.getTransport().state === 'started';
    setLoopPlaying(actuallyPlaying);
  }, [setLoopPlaying]);

  return { loopPlay, stop, reset, isLoopPlaying };
};
