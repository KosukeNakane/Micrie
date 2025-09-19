// [State] entities/model - VolumeContext.tsx
// 役割: グローバル/ローカル状態の保持・提供
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const VOLUME_MIN = 0;
export const VOLUME_MAX = 100;
const STORAGE_KEY = 'app.volume';

type Ctx = { volume: number; setVolume: (v: number) => void };

const VolumeContext = createContext<Ctx | null>(null);

export const VolumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clamp = (v: number) => Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, v));
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw != null) {
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) return clamp(parsed);
      }
    } catch {}
    return 80;
  });

  const setVolume = (v: number) => setVolumeState(clamp(v));

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(volume)); } catch {}
  }, [volume]);

  const value = useMemo(() => ({ volume, setVolume }), [volume]);
  return <VolumeContext.Provider value={value}>{children}</VolumeContext.Provider>;
};

export const useVolume = () => {
  const ctx = useContext(VolumeContext);
  if (!ctx) throw new Error('useVolume must be used within a VolumeProvider');
  return ctx;
};

