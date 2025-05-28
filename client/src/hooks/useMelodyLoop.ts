// メロディループを制御するカスタムフック
// currentSegments.melody のノート情報を基に、テンポに合わせてTone.jsで繰り返し再生する

import { useRef, useState, useEffect, useMemo } from 'react';
import { useSegment } from '../context/SegmentContext';
import * as Tone from 'tone';
import { useTempo } from '../context/TempoContext';

export const useMelodyLoop = () => {
  const segmentsRef = useRef<any[] | null>(null);
  const { loopMode, currentSegments } = useSegment();
  const [isLooping, setIsLooping] = useState(false);
  const isLoopingRef = useRef(false);
  const synthRef = useRef<Tone.Synth | null>(null);
  const { tempo } = useTempo();
  const scheduledIdsRef = useRef<number[]>([]);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  // テンポに基づいて各ノート（チャンク）の長さ（拍の半分）を計算
  const { chunkDuration } = useMemo(() => {
    const beatDuration = 60 / tempo;
    const chunkDuration = beatDuration * 0.5;
    return { chunkDuration };
  }, [tempo]);

  useEffect(() => {
    Tone.getTransport().bpm.value = tempo;
  }, [tempo]);

  // isLooping や melody セグメントの状態に応じて、Tone.jsのループ再生を設定
  useEffect(() => {
    if (!isLoopingRef.current || !segmentsRef.current || !synthRef.current) return;
    if (loopMode === 'rhythm') return;

    if (!segmentsRef.current.some(seg => typeof seg.note === 'string' && seg.note !== 'rest')) {
      console.warn("No playable notes in segments. Melody loop not started.");
      return;
    }
    scheduledIdsRef.current.forEach(id => Tone.getTransport().clear(id));
    scheduledIdsRef.current = [];

    const synth = synthRef.current;

    let index = 0;
    const total = segmentsRef.current.length;

    const loopId = Tone.getTransport().scheduleRepeat((time) => {
      if (!isLoopingRef.current || !segmentsRef.current) return;

      const segment = segmentsRef.current[index % total];
      if (typeof segment.note === 'string' && segment.note !== 'rest') {
        synth.triggerAttackRelease(segment.note, chunkDuration, time);
      }

      index++;
    }, chunkDuration);

    scheduledIdsRef.current.push(loopId);
  }, [isLooping]);

  // Melody モードのときに segments をセットし、ループ再生を開始する
  const playMelody = () => {
    if (loopMode === 'rhythm') {
      console.warn("Loop mode is not melody or both, skipping playMelody.");
      return;
    }
    if (loopMode === 'both') {
      segmentsRef.current = currentSegments.melody;
    } else {
      segmentsRef.current = currentSegments.melody;
    }
    setIsLooping(true);
    isLoopingRef.current = true;

    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().toDestination();
    }
  };

  // 登録済みのループイベントを全て解除し、再生状態を停止する
  const stopMelody = () => {
    scheduledIdsRef.current.forEach(id => Tone.getTransport().clear(id));
    scheduledIdsRef.current = [];
    setIsLooping(false);
    isLoopingRef.current = false;
  };

  return { playMelody, stopMelody };
};