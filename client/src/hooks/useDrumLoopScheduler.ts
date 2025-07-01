// ドラムループの再生をTone.jsでスケジューリングするカスタムフック。
// currentSegments.rhythm の内容に基づいて kick/snare/hihat を再生する。

import { useEffect, useRef, useState, useMemo } from 'react';
import * as Tone from 'tone';
import { useTempo } from '../context/TempoContext';
import { useSegment } from '../context/SegmentContext';

export const useDrumLoopScheduler = () => {
  const { tempo } = useTempo();
  const { loopMode, currentSegments } = useSegment();
  const [isLooping] = useState(false);
  // useStateのisLoopingは常にfalse固定のため、内部状態を参照するためにuseRefを利用
  const isLoopingRef = useRef(false);

  // kick, snare, hihatそれぞれのシンセサイザーを保持するRef
  const synthRef = useRef<{
    kick: Tone.MembraneSynth;
    snare: Tone.NoiseSynth;
    hihat: Tone.NoiseSynth;
  } | null>(null);

  const scheduleIdRef = useRef<number | null>(null);

  // loopModeが'rhythm'のときだけ、currentSegments.rhythmからstepのラベル配列を抽出
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

  // テンポから1ステップ分（8分音符）の時間を算出
  const { stepDuration } = useMemo(() => {
    const stepDuration = 60 / tempo / 2;
    return { stepDuration };
  }, [tempo]);

  // Tone.jsのテンポ情報をリアルタイムに更新
  useEffect(() => {
    Tone.getTransport().bpm.value = tempo;
  }, [tempo]);

  // ドラムループの再生処理
  // normalizedStepsを繰り返し再生するようTone.Transportにスケジュール
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

    // スケジュールされた処理本体：各ステップに応じてドラム音を再生
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

  return null;
};