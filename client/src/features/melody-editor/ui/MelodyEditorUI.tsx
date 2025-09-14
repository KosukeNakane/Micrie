import React, { useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { StyledArea } from '@/shared/ui';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CircleIcon from '@mui/icons-material/Circle';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import * as Tone from 'tone';
import { useSegment } from '@/entities/segment/model/SegmentContext';
import { useGlobalAudio } from '@/entities/audio/model/GlobalAudioContext';

const Container = styled(StyledArea)`
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  box-shadow: none;
  gap: 16px;
  margin-top: 0;
  flex-direction: column;
  align-items: stretch;
  max-width: 1050px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(32, minmax(0, 1fr));
  gap: 2px;
`;

const Card = styled(StyledArea)`
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  min-width: 0;
  min-height: 204px; /* 144 (box) + 28 (label) + 16 (card padding) + 16 (gaps) */
`;

const YellowLabel = styled.div`
  display: grid;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  margin-Left: -7px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(255, 248, 56, 0.9), rgb(255, 210, 97));
  color: #2b2b2b;
  font-weight: 700;
  width: 24px;
  text-align: center;
`;

const SmallBox = styled(StyledArea)`
  flex: 1;
  height: 144px; /* melody用: ピッチ調整ボックスを144pxに固定 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  min-width: 0;
  position: relative;
  /* 中央に出てしまうガラス風の細いボックスを消す */
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
`;

// 上下に配置する矢印ボタン
const ControlButton = styled.span<{ pos: 'up' | 'down' }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  /* 上下の余白を広めに取る */
  ${(p) => (p.pos === 'up' ? 'top: 12px;' : 'bottom: 12px;')}
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const CircleRow = styled.div`
  display: grid;
  grid-template-columns: repeat(1, auto);
  justify-content: center;
  gap: 8px;
  align-items: center;
`;

export const MelodyEditorUI: React.FC = () => {
  const { currentSegments, updateMelodySegment } = useSegment();
  const engine = useGlobalAudio();

  const previousNotesRef = useRef<string[]>([]);
  if (previousNotesRef.current.length !== currentSegments.melody.length) {
    previousNotesRef.current = currentSegments.melody.map(seg => seg.note !== 'rest' ? (seg.note ?? 'C4') : 'C4');
  }

  const triggerPreview = async (note: string) => {
    try { if ((Tone.getContext() as any).state !== 'running') await Tone.start(); } catch { }
    try { await engine.ensureStarted(); } catch { }
    try { await engine.setMasterMuted(false); } catch { }
    try {
      const synth = new Tone.Synth().toDestination();
      synth.triggerAttackRelease(note, '8n');
    } catch { }
  };

  const changePitch = (index: number, delta: number) => {
    const seg = currentSegments.melody[index];
    const note = seg?.note;
    if (!note || note === 'rest') return;
    try {
      const midi = Tone.Frequency(note).toMidi();
      const newMidi = Math.max(0, Math.min(127, midi + delta));
      const newNote = Tone.Frequency(newMidi, 'midi').toNote();
      updateMelodySegment(index, { note: newNote, label: newNote });
      triggerPreview(newNote);
    } catch { }
  };

  const toggleMute = (index: number) => {
    const seg = currentSegments.melody[index];
    if (!seg) return;
    if (seg.note === 'rest') {
      const restored = previousNotesRef.current[index] || 'C4';
      updateMelodySegment(index, { note: restored, label: restored });
      triggerPreview(restored);
    } else {
      const cur = typeof seg.note === 'string' ? seg.note : 'C4';
      previousNotesRef.current[index] = cur;
      updateMelodySegment(index, { note: 'rest', label: 'rest' });
    }
  };

  const uiCards = useMemo(() => currentSegments.melody.slice(0, 32).map((seg, i) => {
    const muted = seg.note === 'rest';
    const label = muted ? '-' : (seg.note ?? '-');
    return (
      <Card key={i}>
        <YellowLabel>{label}</YellowLabel>
        <SmallBox>
          <ControlButton pos="up" role="button" aria-label="pitch-up" onClick={() => changePitch(i, 1)}>
            <ArrowDropUpIcon style={{ fontSize: 40 }} />
          </ControlButton>
          <ControlButton pos="down" role="button" aria-label="pitch-down" onClick={() => changePitch(i, -1)}>
            <ArrowDropDownIcon style={{ fontSize: 40 }} />
          </ControlButton>
        </SmallBox>
        <CircleRow>
          {muted ? (
            <PanoramaFishEyeIcon fontSize="small" onClick={() => toggleMute(i)} style={{ cursor: 'pointer' }} />
          ) : (
            <CircleIcon fontSize="small" onClick={() => toggleMute(i)} style={{ cursor: 'pointer' }} />
          )}
        </CircleRow>
      </Card>
    );
  }), [currentSegments.melody]);

  return (
    <Container>
      <Grid>
        {uiCards}
      </Grid>
    </Container>
  );
};

export default MelodyEditorUI;

