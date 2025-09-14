// [Binder] features/model - ChannelsEngineBinder.tsx
// 役割: エンジン/Transportとアプリ状態の接続（副作用）
import React from 'react';

import { useGlobalAudio, useChannelsStore } from '@/entities/audio';

export const ChannelsEngineBinder: React.FC = () => {
  const engine = useGlobalAudio();
  const melodyMuted = useChannelsStore((s) => s.melodyMuted);
  const drumMuted = useChannelsStore((s) => s.drumMuted);
  const chordMuted = useChannelsStore((s) => s.chordMuted);

  React.useEffect(() => { engine.setChannelMuted('melody', !!melodyMuted); }, [engine, melodyMuted]);
  React.useEffect(() => { engine.setChannelMuted('drum', !!drumMuted); }, [engine, drumMuted]);
  React.useEffect(() => { engine.setChannelMuted('chord', !!chordMuted); }, [engine, chordMuted]);
  return null;
};
