//現在未使用　Tone.jsでメロディーを再生する
//client/src/hooks/useMelodyLoop.ts

// メロディループを制御するカスタムフック
// currentSegments.melody のノート情報を基に、テンポに合わせてTone.jsで繰り返し再生する

import { useRef, useState, useEffect, useMemo } from 'react';
import { useSegment } from '../context/SegmentContext';
// import * as Tone from 'tone';
import { useTempo } from '../context/TempoContext';
import { useScaleMode } from '../context/ScaleModeContext';

// import WebAudioFontPlayer from 'webaudiofont';

export const useMelodyLoop = () => {
  const {scaleMode} = useScaleMode();
  const scaleModeRef = useRef(scaleMode);
  useEffect(() => {
    scaleModeRef.current = scaleMode;
  }, [scaleMode]);
  const segmentsRef = useRef<any[] | null>(null);
  const { loopMode, currentSegments } = useSegment();
  const [isLooping, setIsLooping] = useState(false);
  const isLoopingRef = useRef(false);
  const playerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const instrumentRef = useRef<any>(null);
  const { tempo } = useTempo();

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  // テンポに基づいて各ノート（チャンク）の長さ（拍の半分）を計算
  const { chunkDuration } = useMemo(() => {
    const beatDuration = 60 / tempo;
    const chunkDuration = beatDuration * 0.5;
    return { chunkDuration };
  }, [tempo]);

  // Scale mode mappings
  const majorPentatonicMap: { [note: string]: string } = {
    'C': 'C',
    'C#': 'D',
    'D': 'D',
    'D#': 'E',
    'E': 'E',
    'F': 'G',
    'F#': 'G',
    'G': 'G',
    'G#': 'A',
    'A': 'A',
    'A#': 'C',
    'B': 'C',
  };

  const minorPentatonicMap: { [note: string]: string } = {
    'C': 'C',
    'C#': 'D#',
    'D': 'D#',
    'D#': 'D#',
    'E': 'F',
    'F': 'F',
    'F#': 'G',
    'G': 'G',
    'G#': 'A#',
    'A': 'A#',
    'A#': 'A#',
    'B': 'C',
  };

  // Melody モードのときに segments をセットし、ループ再生を開始する
  // サウンドフォントをCDNから読み込み、WebAudioFontPlayerで再生できるよう準備する
  const loadInstrument = (): Promise<void> => {
    console.log("みすってる1");
    return new Promise((resolve, reject) => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();

        ctx.resume().then(() => {
          const player = new (window as any).WebAudioFontPlayer();
          const sf2 = (window as any)._tone_0000_Aspirin_sf2_file;

          if (!sf2) {
            console.error("SoundFont not found.");
            reject("SoundFont missing.");
            return;
          }

          // queueWaveTable で先に一度鳴らすことでデコードを促す
          player.queueWaveTable(
            ctx,
            ctx.destination,
            sf2,
            ctx.currentTime + 0.1,
            60, // C4
            0.2  // 短く小さめに鳴らす
          );

          playerRef.current = player;
          audioCtxRef.current = ctx;
          instrumentRef.current = sf2;

          console.log("Instrument initialized via direct queueWaveTable");
          resolve();
        }).catch(e => {
          console.error("AudioContext resume failed:", e);
          reject(e);
        });

      } catch (e) {
        console.error("loadInstrument error:", e);
        reject(e);
      }
    });
  };

  const playMelody = async () => {
    console.log("Starting playMelody");
    if (loopMode === 'rhythm') {
      console.warn("Loop mode is not melody or both, skipping playMelody.");
      console.log("Current loopMode:", loopMode);
      return;
    }
    if (loopMode === 'both') {
      segmentsRef.current = currentSegments.melody;
      console.log("Loaded segments:", segmentsRef.current);
    } else {
      segmentsRef.current = currentSegments.melody;
      console.log("Loaded segments:", segmentsRef.current);
    }

    setIsLooping(true);
    isLoopingRef.current = true;

    if (!playerRef.current) {
      try {
        await loadInstrument();
        console.log("Instrument load completed");
        console.log("playerRef.current:", playerRef.current);
        console.log("audioCtxRef.current:", audioCtxRef.current);
        console.log("instrumentRef.current:", instrumentRef.current);
      } catch (e) {
        console.error('Failed to load instrument:', e);
      }
    }

    console.log("Checking for playable notes in segments:", segmentsRef.current);

    const playableSegments = segmentsRef.current.map(seg => {
      if (typeof seg.note === 'string' && /^[A-G]#?\d$/.test(seg.note)) {
        return seg.note;
      } else {
        return 'rest';
      }
    });
    console.log(playableSegments);

    const ctx = audioCtxRef.current!;
    let index = 0;
    const total = playableSegments.length;

    const playNextNote = () => {
      if (!isLoopingRef.current || !playableSegments) return;

      const noteLabel = playableSegments[index % total];
      console.log("Note label:", noteLabel);

      if (typeof noteLabel === 'string' && noteLabel !== 'rest') {
        const match = noteLabel.match(/^([A-G]#?)(\d)$/);
        if (match) {
          const [, pitchClass, octave] = match;

          let noteToPlay = noteLabel;
          if (scaleModeRef.current === 'major') {
            const mapped = majorPentatonicMap[pitchClass];
            if (mapped) noteToPlay = `${mapped}${octave}`;
          } else if (scaleModeRef.current === 'minor') {
            const mapped = minorPentatonicMap[pitchClass];
            if (mapped) noteToPlay = `${mapped}${octave}`;
          }

          console.log("Original pitch class:", pitchClass, "Octave:", octave);
          console.log("Mapped note:", noteToPlay);
          const midiNoteNumber = noteToMidiNumber(noteToPlay);
          console.log("MIDI note number:", midiNoteNumber);
          (playerRef.current as any).queueWaveTable(
            ctx,
            ctx.destination,
            instrumentRef.current,
            ctx.currentTime,
            midiNoteNumber,
            chunkDuration,
            0.9
          );
        }
      }

      index++;
      if (isLoopingRef.current) {
        setTimeout(playNextNote, chunkDuration * 1000);
      }
    };

    // ワンテンポ遅れて再生を開始（BPM120のとき0.25秒）
    setTimeout(playNextNote, chunkDuration * 1000);
  };

  // 登録済みのループイベントを全て解除し、再生状態を停止する
  const stopMelody = () => {
    setIsLooping(false);
    isLoopingRef.current = false;
  };

  const noteToMidiNumber = (note: string): number => {
    const noteMap: { [key: string]: number } = {
      C: 0, Cs: 1, D: 2, Ds: 3, E: 4, F: 5, Fs: 6,
      G: 7, Gs: 8, A: 9, As: 10, B: 11,
    };
    const match = note.match(/^([A-G]#?)(\d)$/);
    if (!match) throw new Error(`Invalid note format: ${note}`);
    const [_, noteName, octaveStr] = match;
    const key = noteName.replace('#', 's');
    return (parseInt(octaveStr) + 1) * 12 + noteMap[key];
  };

  return { playMelody, stopMelody };
};