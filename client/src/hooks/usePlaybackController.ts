// 各プレイヤー（コード・メロディ・ドラム）を制御し、ループ再生機能を提供するカスタムフック。
// メロディーは定量化（Quantize）され、スケールモードに応じてピッチマップが適用される。

import { useEffect, useMemo } from 'react';
// import { useAudioEngine } from './useAudioEngine.ts';
import { useChordsPlayer } from './useChordsPlayer';
import { useMelodyPlayer } from './useMelodyPlayer';
import { useDrumPlayer } from './useDrumPlayer';
import { useTempo } from '../context/TempoContext';
import { useSegment } from '../context/SegmentContext';
import { extractQuantizedNotes } from '../utils/noteSegmentation';
import { useScaleMode } from '../context/ScaleModeContext';
import { majorPentatonicMap, minorPentatonicMap } from '../utils/pitchMaps.ts';
import * as Tone from 'tone';
import { GlobalAudioEngine } from '../audio/GlobalAudioEngine';
import { useTransportStore } from '../stores/useTransportStore';

const DEBUG = false; // trueでデバッグログ

export const usePlaybackController = () => {
  // Zustand: 再生状態の単一の真実を利用
  const isLoopPlaying = useTransportStore((s) => s.isLoopPlaying);
  const setLoopPlaying = useTransportStore((s) => s.setLoopPlaying);

  // const { audioCtx } = useAudioEngine();
  const { tempo } = useTempo();
  const { currentSegments } = useSegment();
  const { scaleMode } = useScaleMode();

  // Melodyセグメントから音名（または'rest'）のみを抽出し配列化
  const rawMelody = useMemo(() => {
    return currentSegments.melody.map((seg) => {
      if (typeof seg.note === 'string' && /^[A-G]#?\d$/.test(seg.note)) {
        return seg.note;
      } else {
        return 'rest';
      }
    });
  }, [currentSegments.melody]);

  // 音列をスケールモードに応じて定量化（quantize）する
  const quantizedMelody = useMemo(() => {
    return scaleMode === 'chromatic'
      ? extractQuantizedNotes(rawMelody, 'major', { major: {}, minor: {} })
      : extractQuantizedNotes(rawMelody, scaleMode, {
        major: majorPentatonicMap,
        minor: minorPentatonicMap,
      });
  }, [rawMelody, scaleMode]);

  // デバッグ用ログ：定量化されたメロディーを表示
  useEffect(() => {
    if (DEBUG) console.log('🎹 quantizedMelody:', quantizedMelody);
  }, [quantizedMelody]);

  // テンポに基づく音価の算出（コード＝8分音符、メロディ＝16分音符）
  const chordDuration = 60 / tempo / 2; // 8分音符
  const melodyDuration = 60 / tempo / 4; // 16分音符

  const { playChords } = useChordsPlayer();
  const { playMelody } = useMelodyPlayer();
  const { playDrumLoop } = useDrumPlayer();

  // ループ再生を開始する関数
  // 各トラックを時間に合わせて再生し、2小節ごとに繰り返す
  const loopPlay = async () => {
    if (isLoopPlaying) return;

    // 🔓 ユーザー操作直下で呼ばれる想定：オーディオを解禁
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    await GlobalAudioEngine.instance.ensureStarted();

    const ac = GlobalAudioEngine.instance.audioContext;
    if (!ac) return; // 予防

    const loopLengthInBeats = '2m';

    const playOnce = (time: number) => {
      playChords(time, chordDuration);
      playDrumLoop(time);
      quantizedMelody.forEach(({ note, startIndex, length }) => {
        const startTime = time + melodyDuration * startIndex;
        const noteDuration = melodyDuration * length;
        playMelody(note, startTime, noteDuration);
      });
    };

    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    const alignedStart = Tone.getTransport().seconds;
    Tone.getTransport().scheduleRepeat((time) => playOnce(time), loopLengthInBeats, alignedStart);
    Tone.getTransport().start(undefined, alignedStart);

    // ✅ Zustandへ同期
    setLoopPlaying(true);
  };

  // ループ再生を停止し、Transportスケジュールもクリア
  const stop = () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    // ✅ Zustandへ同期
    setLoopPlaying(false);
  };

  // 画面復帰時などに「実エンジンの状態」をZustandへ同期
  useEffect(() => {
    const actuallyPlaying = Tone.getTransport().state === 'started';
    setLoopPlaying(actuallyPlaying);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loopPlay, stop, isLoopPlaying };
};