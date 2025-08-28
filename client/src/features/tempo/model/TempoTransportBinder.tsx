import { useEffect } from 'react';
import * as Tone from 'tone';

import { useTempo } from '@entities/tempo/model/TempoContext';

// Keep Tone.Transport BPM in sync with global tempo context across all pages.
export const TempoTransportBinder: React.FC = () => {
  const { tempo } = useTempo();

  useEffect(() => {
    try {
      Tone.getTransport().bpm.value = tempo;
    } catch {}
  }, [tempo]);

  return null;
};

