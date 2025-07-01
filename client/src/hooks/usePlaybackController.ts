// 各プレイヤー（コード・メロディ・ドラム）を制御し、ループ再生機能を提供するカスタムフック。
// メロディーは定量化（Quantize）され、スケールモードに応じてピッチマップが適用される。

import { useState, useEffect, useMemo } from 'react';
import { useAudioEngine } from './useAudioEngine.ts';
import { useChordsPlayer } from './useChordsPlayer';
import { useMelodyPlayer } from './useMelodyPlayer'; 
import { useDrumPlayer } from './useDrumPlayer';
import { useTempo } from '../context/TempoContext';
import { useSegment } from '../context/SegmentContext';
import { extractQuantizedNotes } from '../utils/noteSegmentation';
import { useScaleMode } from '../context/ScaleModeContext';
import { majorPentatonicMap, minorPentatonicMap } from '../utils/pitchMaps.ts';
import * as Tone from 'tone';



export const usePlaybackController = () => {
  const { audioCtx } = useAudioEngine();
  const { tempo } = useTempo();
  const { currentSegments } = useSegment();
  const { scaleMode } = useScaleMode();

  // Melodyセグメントから音名（または'rest'）のみを抽出し配列化
  const rawMelody = useMemo(() => {
    return currentSegments.melody.map(seg => {
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
          minor: minorPentatonicMap
        });
  }, [rawMelody, scaleMode]);

  // デバッグ用ログ：定量化されたメロディーを表示
  useEffect(() => {
    console.log('🎹 quantizedMelody:', quantizedMelody);
  }, [quantizedMelody]);

  // テンポに基づく音価の算出（コード＝8分音符、メロディ＝16分音符）
  const chordDuration = 60 / tempo / 2; // 8分音符
  const melodyDuration = 60 / tempo / 4; // 16分音符

  const { playChords } = useChordsPlayer();
  const { playMelody } = useMelodyPlayer();
  const { playDrumLoop } = useDrumPlayer();


  const [isLoopPlaying, setIsLoopPlaying] = useState(false);

  useEffect(() => {
    return () => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    };
  }, []);

  // ループ再生を開始する関数
  // 各トラックを時間に合わせて再生し、2小節ごとに繰り返す
  const loopPlay = () => {
    if (!audioCtx || isLoopPlaying) return;

    const totalSteps = rawMelody.length; //現在は2小節で固定しているため未使用
    const loopLengthInBeats = "2m";

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
    setIsLoopPlaying(true);
  };

  // ループ再生を停止し、Transportスケジュールもクリア
  const stop = () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    setIsLoopPlaying(false);
  };

  return { loopPlay, stop, isLoopPlaying };
};