import { useEffect } from 'react';

import { useGlobalAudio } from '@entities/audio/model/GlobalAudioContext';
import { useVolume } from '@entities/volume/model/VolumeContext';

// Keep GlobalAudioEngine master volume in sync with volume context across all pages.
export const VolumeEngineBinder: React.FC = () => {
  const { volume } = useVolume();
  const engine = useGlobalAudio();

  useEffect(() => {
    (async () => {
      try { await engine.ensureStarted(); } catch {}
      try { engine.setMasterVolume(Math.max(0, Math.min(1, volume / 100))); } catch {}
    })();
  }, [volume, engine]);

  return null;
};

