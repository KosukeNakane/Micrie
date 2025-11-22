// [UI] features/ui - VolumeControlPanel.tsx
// 役割: 表示・入力のUIコンポーネント（EffectsPanelのフェーダーUIをVolume用に）
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import React from 'react';

import { useChannelsStore } from '@entities/audio';
import { useVolume, VOLUME_MIN as MIN, VOLUME_MAX as MAX } from '@entities/volume/model/VolumeContext';
import EffectsPanel from '@features/effects/ui/EffectsPanel';
import { VerticalFader } from '@features/effects/ui/VerticalFader';

type Props = {
  width?: number;
};

const VolumeControlPanel: React.FC<Props> = ({ width = 360 }) => {
  const { volume, setVolume } = useVolume();
  const normalized = Math.max(0, Math.min(1, volume / MAX));
  const melodyVol = useChannelsStore((s) => s.melodyVolume);
  const drumVol = useChannelsStore((s) => s.drumVolume);
  const chordVol = useChannelsStore((s) => s.chordVolume);
  const samplerVol = useChannelsStore((s) => s.samplerVolume);
  const setChannelVolume = useChannelsStore((s) => s.setVolume);
  const melodyMuted = useChannelsStore((s) => s.melodyMuted);
  const drumMuted = useChannelsStore((s) => s.drumMuted);
  const chordMuted = useChannelsStore((s) => s.chordMuted);
  const samplerMuted = useChannelsStore((s) => s.samplerMuted);
  const toggleMuted = useChannelsStore((s) => s.toggleMuted);
  const masterMuted = useChannelsStore((s) => s.masterMuted);
  const toggleMasterMuted = useChannelsStore((s) => s.toggleMasterMuted);

  const iconFor = (muted: boolean, value01: number) => {
    if (muted) return <VolumeOffIcon fontSize="large" />;
    if (value01 <= 0) return <VolumeMuteIcon fontSize="large" />;
    return value01 <= 0.5 ? <VolumeDownIcon fontSize="large" /> : <VolumeUpIcon fontSize="large" />;
  };

  return (
    <EffectsPanel width={width}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', justifyContent: 'center' }}>
        {/* Master */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <VerticalFader
            label="MASTER"
            value={normalized}
            onChange={(v) => setVolume(Math.round(MIN + v * (MAX - MIN)))}
            width={60}
            height={180}
          />
          <button
            aria-label={masterMuted ? 'Unmute master' : 'Mute master'}
            onClick={() => toggleMasterMuted()}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', paddingTop: 4 }}
          >
            {iconFor(masterMuted, normalized)}
          </button>
        </div>
        {/* Melody */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <VerticalFader
            label="MELODY"
            value={Math.max(0, Math.min(1, melodyVol / 100))}
            onChange={(v) => setChannelVolume('melody', Math.round(v * 100))}
            width={60}
            height={180}
          />
          <button
            aria-label={melodyMuted ? 'Unmute melody' : 'Mute melody'}
            onClick={() => toggleMuted('melody')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', paddingTop: 4 }}
          >
            {iconFor(melodyMuted, Math.max(0, Math.min(1, melodyVol / 100)))}
          </button>
        </div>
        {/* Chords */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 4 }}>
          <VerticalFader
            label="CHORD"
            value={Math.max(0, Math.min(1, chordVol / 100))}
            onChange={(v) => setChannelVolume('chord', Math.round(v * 100))}
            width={60}
            height={180}
          />
          <button
            aria-label={chordMuted ? 'Unmute chord' : 'Mute chord'}
            onClick={() => toggleMuted('chord')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', paddingTop: 4 }}
          >
            {iconFor(chordMuted, Math.max(0, Math.min(1, chordVol / 100)))}
          </button>
        </div>
        {/* Drums */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <VerticalFader
            label="DRUM"
            value={Math.max(0, Math.min(1, drumVol / 100))}
            onChange={(v) => setChannelVolume('drum', Math.round(v * 100))}
            width={60}
            height={180}
          />
          <button
            aria-label={drumMuted ? 'Unmute drum' : 'Mute drum'}
            onClick={() => toggleMuted('drum')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', paddingTop: 4 }}
          >
            {iconFor(drumMuted, Math.max(0, Math.min(1, drumVol / 100)))}
          </button>
        </div>
        {/* Sampler */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <VerticalFader
            label="SAMPLER"
            value={Math.max(0, Math.min(1, samplerVol / 100))}
            onChange={(v) => setChannelVolume('sampler', Math.round(v * 100))}
            width={60}
            height={180}
          />
          <button
            aria-label={samplerMuted ? 'Unmute sampler' : 'Mute sampler'}
            onClick={() => toggleMuted('sampler')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', paddingTop: 4 }}
          >
            {iconFor(samplerMuted, Math.max(0, Math.min(1, samplerVol / 100)))}
          </button>
        </div>
      </div>
    </EffectsPanel >
  );
};

export default VolumeControlPanel;
