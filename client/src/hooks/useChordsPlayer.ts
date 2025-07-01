// コード進行の再生を担当するカスタムフック。
// 選択されたコードパターンに基づき、ピアノサンプラーを使ってコードを順次再生する。
// ピアノサンプラー用フック

import { useEffect } from 'react';

// Tone.jsをimport（必要ならnpmでインストールしておくこと）
// @ts-ignore
import * as Tone from 'tone';
import { usePianoSampler } from './usePianoSampler';
import { useChordPattern } from '../context/ChordPatternContext';
import { useMemo } from 'react';

type Chord = string[]; // 例: ['C4', 'E4', 'G4']
declare const _tone_0000_Aspirin_sf2_file: any;

export const useChordsPlayer = () => {
  const { chordPattern } = useChordPattern(); // Contextから取得
  const pianoSamplerRef = usePianoSampler();

  // 定義済みのコード進行パターンを用意（pattern1〜7）
  // 各コードは [ルート音], [コード構成音] の2ステップを繰り返す構成になっている
  const patterns: { [key: string]: Chord[] } = useMemo(() => ({
    pattern1: [//just the two of us進行
      ['F4'], ['F4', 'A4', 'C5', 'E5'],
      ['F4'], ['F4', 'A4', 'C5', 'E5'],
      ['E4'], ['E4', 'G#4', 'B4', 'D5'],
      ['E4'], ['E4', 'G#4', 'B4', 'D5'],
      ['A3'], ['A3', 'C4', 'E4', 'G4'],
      ['A3'], ['A3', 'C4', 'E4', 'G4'],
      ['G3'], ['G3', 'A#3', 'D4', 'F4'],
      ['C4'], ['C4', 'E4', 'G4', 'A#4'],
    ],
    pattern2: [//ポップ・パンク進行1564
      ['C4'], ['C4', 'E4', 'G4'],
      ['C4'], ['C4', 'E4', 'G4'],
      ['G3'], ['G3', 'B3', 'D4'],
      ['G3'], ['G3', 'B3', 'D4'],
      ['A3'], ['A3', 'C4', 'E4'],
      ['A3'], ['A3', 'C4', 'E4'],
      ['F3'], ['F3', 'A3', 'C4'],
      ['F3'], ['F3', 'A3', 'C4'],
    ],
    pattern3: [ // F G Am Am
      ['F4'], ['F4', 'A4', 'C5'],
      ['F4'], ['F4', 'A4', 'C5'],
      ['G4'], ['G4', 'B4', 'D5'],
      ['G4'], ['G4', 'B4', 'D5'],
      ['A4'], ['A4', 'C5', 'E5'],
      ['A4'], ['A4', 'C5', 'E5'],
      ['A4'], ['A4', 'C5', 'E5'],
      ['A4'], ['A4', 'C5', 'E5'],

    ],
    pattern4: [ // F G Em Am
      ['F4'], ['F4', 'A4', 'C5'],
      ['F4'], ['F4', 'A4', 'C5'],
      ['G4'], ['G4', 'B4', 'D5'],
      ['G4'], ['G4', 'B4', 'D5'],
      ['E4'], ['E4', 'G4', 'B4'],
      ['E4'], ['E4', 'G4', 'B4'],
      ['A4'], ['A4', 'C5', 'E5'],
      ['A4'], ['A4', 'C5', 'E5'],

    ],
    pattern5: [ // Am F G C
      ['A4'], ['A4', 'C5', 'E5'],
      ['A4'], ['A4', 'C5', 'E5'],
      ['F4'], ['F4', 'A4', 'C5'],
      ['F4'], ['F4', 'A4', 'C5'],
      ['G4'], ['G4', 'B4', 'D5'],
      ['G4'], ['G4', 'B4', 'D5'],
      ['C5'], ['C5', 'E5', 'G5'],
      ['C5'], ['C5', 'E5', 'G5'],

    ],
    pattern6: [ // A F C G
      ['A4'], ['A4', 'C5', 'E5'],
      ['F4'], ['F4', 'A4', 'C5'],
      ['C5'], ['C5', 'E5', 'G5'],
      ['G4'], ['G4', 'B4', 'D5'],
      ['A4'], ['A4', 'C5', 'E5'],
      ['F4'], ['F4', 'A4', 'C5'],
      ['C5'], ['C5', 'E5', 'G5'],
      ['G4'], ['G4', 'B4', 'D5'],
    ],
    pattern7: [ // カノン進行: C G/B Am Em/B F C/E F G (with root + chord repetition)
      ['C4'], ['C4', 'E4', 'G4'],
      ['G3'], ['G3', 'B3', 'D4'],
      ['A3'], ['A3', 'C4', 'E4'],
      ['E3'], ['E3', 'B3', 'G4'],
      ['F3'], ['F3', 'A3', 'C4'],
      ['E3'], ['E3', 'C4', 'G4'],
      ['F3'], ['F3', 'A3', 'C4'],
      ['G3'], ['G3', 'B3', 'D4'],
    ],
  }), []);

  // 選択されたコードパターンを取得（存在しなければ pattern1 を使用）
  const chords = patterns[chordPattern] || patterns['pattern1'];

  // サンプラーの音量を調整（初期化時）
  useEffect(() => {
    if (pianoSamplerRef.current) {
      pianoSamplerRef.current.volume.value = -6; // dB
    }
  }, [pianoSamplerRef]);

  // コード進行を再生する関数
  // 各コードを duration 間隔で順に再生
  const playChords = (startTime: number, duration: number) => {
    chords.forEach((chord, i) => {
      const time = startTime + i * duration;
      // コード内の各ノートをピアノサンプラーで同時に鳴らす
      chord.forEach(note => {
        pianoSamplerRef.current?.triggerAttackRelease(note, duration, time);
      });
    });
  };

  return { playChords };
};