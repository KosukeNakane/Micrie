// [Binder] features/model - ChannelsEngineBinder.tsx
// 役割: エンジン/Transportとアプリ状態の接続（副作用）
import React from 'react';

import { useGlobalAudio, useChannelsStore } from '@/entities/audio';

export const ChannelsEngineBinder: React.FC = () => {
  const engine = useGlobalAudio();
  const melodyMuted = useChannelsStore((s) => s.melodyMuted);
  const drumMuted = useChannelsStore((s) => s.drumMuted);
  const chordMuted = useChannelsStore((s) => s.chordMuted);
  const melodyVolume = useChannelsStore((s) => s.melodyVolume);
  const drumVolume = useChannelsStore((s) => s.drumVolume);
  const chordVolume = useChannelsStore((s) => s.chordVolume);
  const masterMuted = useChannelsStore((s) => s.masterMuted);

  React.useEffect(() => { engine.setChannelMuted('melody', !!melodyMuted); }, [engine, melodyMuted]);
  React.useEffect(() => { engine.setChannelMuted('drum', !!drumMuted); }, [engine, drumMuted]);
  React.useEffect(() => { engine.setChannelMuted('chord', !!chordMuted); }, [engine, chordMuted]);
  React.useEffect(() => { try { engine.setChannelVolume('melody', Math.max(0, Math.min(1, melodyVolume / 100))); } catch {} }, [engine, melodyVolume]);
  React.useEffect(() => { try { engine.setChannelVolume('drum', Math.max(0, Math.min(1, drumVolume / 100))); } catch {} }, [engine, drumVolume]);
  React.useEffect(() => { try { engine.setChannelVolume('chord', Math.max(0, Math.min(1, chordVolume / 100))); } catch {} }, [engine, chordVolume]);
  React.useEffect(() => { try { engine.setMasterMuted(!!masterMuted); } catch {} }, [engine, masterMuted]);
  return null;
};
