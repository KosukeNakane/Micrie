import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

let _sampler: Tone.Sampler | null = null;
let _loaded = false;

const getOrCreateSampler = () => {
  if (_sampler) return _sampler;
  _sampler = new Tone.Sampler({
    urls: {
      A1: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A1.wav',
      A2: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A2.wav',
      A3: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A3.wav',
      A4: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A4.wav',
      A5: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A5.wav',
      A6: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A6.wav',
      A7: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A7.wav',
      A8: 'samples/PublicSamples/IvyAudio-Pianoin162_Close/A8.wav',
      'D#2': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds2.wav',
      'D#3': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds3.wav',
      'D#5': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds5.wav',
      'D#6': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds6.wav',
      'D#7': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds7.wav',
      'D#8': 'samples/PublicSamples/IvyAudio-Pianoin162_Close/Ds8.wav',
    },
    release: 1,
    onload: () => { if (!_loaded) { _loaded = true; console.log('Piano Sampler loaded'); } },
  }).toDestination();
  return _sampler;
};

export const usePianoSampler = () => {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  useEffect(() => { samplerRef.current = getOrCreateSampler(); return () => {}; }, []);
  return samplerRef;
};
