// ドラムループの再生を管理するカスタムフック。
// 現在のテンポとセグメント情報に基づき、kick/snare/hihatをTone.jsで繰り返し再生する。

import { useEffect, useRef, useState, useMemo } from 'react';
import * as Tone from 'tone';
import { useTempo } from '../context/TempoContext';
import { useSegment } from '../context/SegmentContext';

export const useDrumLoop = () => {
  const { tempo } = useTempo();
  const { loopMode, currentSegments } = useSegment();
  const [isLooping, setIsLooping] = useState(false);
  const isLoopingRef = useRef(false);

  const synthRef = useRef<{
    kick: Tone.MembraneSynth;
    snare: Tone.NoiseSynth;
    hihat: Tone.MetalSynth;
  } | null>(null);

  const scheduleIdRef = useRef<number | null>(null);

  // 現在のloopModeに応じて、再生対象となるドラムステップのラベル配列を生成
  const normalizedSteps = useMemo(() => {
    if (!currentSegments || typeof currentSegments !== 'object') return [];

    const selectedSegments = loopMode === 'rhythm'
      ? currentSegments.rhythm
      : loopMode === 'melody'
      ? []
      : currentSegments.rhythm;

    return selectedSegments
      .filter((step): step is { label: string; start: number; end: number } =>
        typeof step.label === 'string' &&
        typeof step.start === 'number' &&
        typeof step.end === 'number'
      )
      .map(step => step.label.trim().toLowerCase());
  }, [currentSegments, loopMode]);

  // テンポに基づいて各ステップの長さ（8分音符1つ分）を計算
  const { stepDuration } = useMemo(() => {
    const stepDuration = 60 / tempo / 2;
    return { stepDuration };
  }, [tempo]);

  // テンポが変化したときにTone.jsのテンポを更新
  useEffect(() => {
    Tone.getTransport().bpm.value = tempo;
  }, [tempo]);

  // ループが有効なときにTone.jsのscheduleRepeatでドラムを繰り返し再生
  useEffect(() => {
    isLoopingRef.current = isLooping;

    if (!isLooping || !synthRef.current) return;

    if (!normalizedSteps.some(step => ['kick', 'snare', 'hihat'].includes(step))) {
      console.warn("No valid drum steps found.");
      return;
    }

    const synth = synthRef.current;
    let index = 0;
    const totalSteps = normalizedSteps.length;

    const id = Tone.getTransport().scheduleRepeat((time) => {
      if (!isLoopingRef.current) return;

      const step = normalizedSteps[index % totalSteps];
      if (step === 'kick') {
        synth.kick.triggerAttackRelease("C1", "8n", time);
      } else if (step === 'snare') {
        synth.snare.triggerAttackRelease("8n", time);
      } else if (step === 'hihat') {
        synth.hihat.triggerAttackRelease("16n", time);
      }

      index++;
    }, stepDuration);

    scheduleIdRef.current = id;

    return () => {
      if (scheduleIdRef.current !== null) {
        Tone.getTransport().clear(scheduleIdRef.current);
        scheduleIdRef.current = null;
      }
    };
  }, [isLooping, normalizedSteps, stepDuration]);

  // ドラムシンセの初期化を行い、ループを開始する
  const startRhythm = async () => {
    if (!synthRef.current) {
      await Tone.start();
      const hihatOptions = {
        frequency: 400,
        envelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0.0,
          release: 0.8,
          attackCurve: "exponential",
          releaseCurve: "exponential",
          decayCurve: "exponential"
        },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      } as unknown as Tone.MetalSynthOptions;

      synthRef.current = {
        kick: new Tone.MembraneSynth().toDestination(),
        snare: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
        }).toDestination(),
        hihat: new Tone.MetalSynth(hihatOptions).toDestination()
      };
    }

    setIsLooping(true);
    isLoopingRef.current = true;
  };

  // ループを停止し、スケジューラーを解除する
  const stopRhythm = () => {
    setIsLooping(false);
    isLoopingRef.current = false;
    if (scheduleIdRef.current !== null) {
      Tone.getTransport().clear(scheduleIdRef.current);
      scheduleIdRef.current = null;
    }
  };

  return { isLooping, startRhythm, stopRhythm };
};