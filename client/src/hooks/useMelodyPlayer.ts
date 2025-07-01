// Melodyパートの音を再生するためのカスタムフック。
// スケールモードに応じたピッチ補正を行い、可聴性を上げるため2オクターブ上にトランスポーズして再生する。

import { useScaleMode } from '../context/ScaleModeContext';
import { usePianoSampler } from './usePianoSampler';
import { majorPentatonicMap, minorPentatonicMap } from '../utils/pitchMaps';

declare const _tone_0000_Aspirin_sf2_file: any;

// 音階のオクターブを+3して上に移調するユーティリティ関数
const transposeUpTwoOctaves = (note: string): string => {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return note;
  const [, pitch, octave] = match;
  const newOctave = parseInt(octave) + 3;
  return `${pitch}${newOctave}`;
};

export const useMelodyPlayer = () => {
  // ピアノサンプラーを初期化
  const player = usePianoSampler();

  const { scaleMode } = useScaleMode();

  // 指定されたノートを再生する関数
  // - 'rest' はスキップ
  // - ピッチマップによる補正とトランスポーズを実行
  const playMelody = (note: string, startTime: number, duration: number) => {
    if (typeof note !== 'string' || note.trim() === '' || note === 'rest') {
      console.log(`Skipping rest or invalid note: ${note}`);
      return;
    }
    try {
      // 音名とオクターブに分解し、スケールモードに応じてピッチを変換
      const pitchClass = note.replace(/\d/, '');
      const octave = note.match(/\d/)?.[0] || '4';
      const mappedPitch = scaleMode === 'minor'
        ? minorPentatonicMap[pitchClass]
        : majorPentatonicMap[pitchClass];
      const mappedNote = mappedPitch + octave;
      // トランスポーズして高音域に移動
      const transposedNote = transposeUpTwoOctaves(mappedNote);
      console.log(`🎵 Playing: ${transposedNote}, duration: ${duration}s, startTime: ${startTime}`);
      // Sampler を使って指定タイミング・長さで音を鳴らす
      player.current?.triggerAttackRelease(transposedNote, duration, startTime);
    } catch (e) {
      console.error(`Failed to play note "${note}":`, e);
    }
  };

  return { playMelody };
};