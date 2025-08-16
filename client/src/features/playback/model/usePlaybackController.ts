import { useEffect, useMemo } from 'react';
import { useChordsPlayer } from '@features/playback/model/useChordsPlayer';
import { useMelodyPlayer } from '@features/playback/model/useMelodyPlayer';
import { useDrumPlayer } from '@features/playback/model/useDrumPlayer';
import { useTempo } from '@entities/tempo/model/TempoContext';
import { useSegment } from '@entities/segment/model/SegmentContext';
import { extractQuantizedNotes } from '@shared/lib/noteSegmentation';
import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';
import { majorPentatonicMap, minorPentatonicMap } from '@shared/lib/pitchMaps';
import * as Tone from 'tone';
import { GlobalAudioEngine } from '@entities/audio/lib/GlobalAudioEngine';
import { useTransportStore } from '@entities/transport/model/useTransportStore';

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

  const chordDuration = 60 / tempo / 2;
  const melodyDuration = 60 / tempo / 4;

  const { playChords } = useChordsPlayer();
  const { playMelody } = useMelodyPlayer();
  const { playDrumLoop } = useDrumPlayer();

  const loopPlay = async () => {
    if (isLoopPlaying) return;
    if (Tone.getContext().state !== 'running') await Tone.start();
    await GlobalAudioEngine.instance.ensureStarted();

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
    setLoopPlaying(true);
  };

  const stop = () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    setLoopPlaying(false);
  };

  useEffect(() => {
    const actuallyPlaying = Tone.getTransport().state === 'started';
    setLoopPlaying(actuallyPlaying);
  }, [setLoopPlaying]);

  return { loopPlay, stop, isLoopPlaying };
};

