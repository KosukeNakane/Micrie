import React from 'react';
import { useGlobalAudio } from '@/entities/audio/model/GlobalAudioContext';
import { useChannelsStore } from '@/entities/audio/model/useChannelsStore';

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

