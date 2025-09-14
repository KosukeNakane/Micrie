import styled from '@emotion/styled';
import AdjustIcon from '@mui/icons-material/Adjust';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CircleIcon from '@mui/icons-material/Circle';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import React, { useMemo } from 'react';
import * as Tone from 'tone';

import { useGlobalAudio } from '@/entities/audio';
import { useChords } from '@/entities/chords';
import { StyledArea } from '@/shared/ui';

type Chord = {
  rootIndex: number; // 0-11
  quality: 'maj' | 'min' | 'dim' | 'aug';
  tension: '' | 'maj7' | '7' | '6' | '9' | '11' | '13';
};

const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
const QUALITIES: Chord['quality'][] = ['maj', 'min', 'dim', 'aug'];
const TENSIONS: Chord['tension'][] = ['', 'maj7', '7', '6', '9', '11', '13'];

const Container = styled(StyledArea)`
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  box-shadow: none;
  gap: 16px;
  flex-direction: column;
  align-items: stretch;
  max-width: 1050px;
`;

const Grid = styled.div<{ cols: number }>`
  display: grid;
  grid-template-columns: ${({ cols }) => `repeat(${cols}, minmax(0, 1fr))`};
  gap: 8px;
`;

const Card = styled(StyledArea)`
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0; /* Grid内の左右autoマージンを無効化してはみ出し防止 */
  min-width: 0; /* 内部コンテンツが幅を押し広げないように */
`;

const YellowLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(255, 248, 56, 0.9), rgb(255, 210, 97));
  color: #2b2b2b;
  font-weight: 700;
  width: 100%;
  text-align: left;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
`;

const TriadBox = styled(StyledArea)`
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  margin: 0; /* 内側要素も左右autoマージンを打ち消す */
  min-width: 0;
  position: relative;
`;

const CircleRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  justify-content: center;
  gap: 8px;
  align-items: center;
`;

const BoxLabel = styled.div`
  flex: 0 1 auto;
  text-align: center;
  font-weight: 700;
`;

const SideButton = styled.span<{ pos: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(p) => (p.pos === 'left' ? 'left: 6px;' : 'right: 6px;')}
  display: flex;
  align-items: center;
  cursor: pointer;
`;

function formatChord(chord: Chord) {
  const root = NOTES[chord.rootIndex];
  const qSuffix = chord.quality === 'maj' ? '' : chord.quality === 'min' ? 'm' : chord.quality;
  return `${root}${qSuffix}${chord.tension}`;
}

// 2つの丸を横並びで表示（塗りあり + 塗りなし）

export const ChordsEditor: React.FC = () => {
  const engine = useGlobalAudio();
  const { slots, setChordAt, setSlotPlayType, bars } = useChords();
  const ICONS = [CircleIcon, AdjustIcon, PanoramaFishEyeIcon] as const;

  // MelodySegmentEditor と同等のプレビュー仕様：
  // - ユーザー操作のたびに短く試聴音を鳴らす
  // - AudioContext/Tone 起動とミュート解除を保証
  // - 同時発音で三和音＋テンションを鳴らす
  const poly = React.useMemo(() => new Tone.PolySynth(Tone.Synth).toDestination(), []);

  const chordToNotes = (c: Chord): string[] => {
    // ルートは 3 オクターブ基準（低すぎ/高すぎ防止）
    const rootName = `${NOTES[c.rootIndex]}3`;
    let rootMidi = 60; // fallback C4
    try { rootMidi = Tone.Frequency(rootName).toMidi(); } catch { /* noop */ }
    const intervals: number[] = (() => {
      switch (c.quality) {
        case 'min': return [0, 3, 7];
        case 'dim': return [0, 3, 6];
        case 'aug': return [0, 4, 8];
        default: return [0, 4, 7]; // maj
      }
    })();
    const ext: number | null = (() => {
      switch (c.tension) {
        case 'maj7': return 11;
        case '7': return 10;
        case '6': return 9;
        case '9': return 14;
        case '11': return 17;
        case '13': return 21;
        default: return null;
      }
    })();
    const mids = intervals.map(iv => rootMidi + iv);
    if (ext !== null) mids.push(rootMidi + ext);
    // 音域を適度に保つため、C6(84)を超える場合は1オクターブ下げる簡易処理
    const bounded = mids.map(m => (m > 84 ? m - 12 : m));
    return bounded.map(m => Tone.Frequency(m, 'midi').toNote());
  };

  const previewChord = async (c: Chord) => {
    try { if ((Tone.getContext() as any).state !== 'running') await Tone.start(); } catch { }
    try { await engine.ensureStarted(); } catch { }
    try { await engine.setMasterMuted(false); } catch { }
    try {
      const notes = chordToNotes(c);
      poly.triggerAttackRelease(notes, '8n');
    } catch { }
  };

  const cards = useMemo(() => slots.map((slot, i) => {
    const c = slot.chord;
    // アイコン循環クリックハンドラ
    const cycleIcon = (pos: 0 | 1) => () => {
      const currentType = slot.plays[pos];
      const nextType = currentType === 'chord' ? 'root' : currentType === 'root' ? 'rest' : 'chord';
      setSlotPlayType(i, pos, nextType);
    };
    const typeToIconIndex = (t: 'chord' | 'root' | 'rest') => (t === 'chord' ? 0 : t === 'root' ? 1 : 2);
    const LeftIcon = ICONS[typeToIconIndex(slot.plays[0])];
    const RightIcon = ICONS[typeToIconIndex(slot.plays[1])];
    const label = formatChord(c);
    const nextRoot = (dir: 1 | -1) => () => {
      const next: Chord = { ...c, rootIndex: (c.rootIndex + dir + 12) % 12 };
      setChordAt(i, { rootIndex: next.rootIndex });
      previewChord(next);
    };
    const nextQuality = (dir: 1 | -1) => () => {
      const idx = QUALITIES.indexOf(c.quality);
      const ni = (idx + dir + QUALITIES.length) % QUALITIES.length;
      const next: Chord = { ...c, quality: QUALITIES[ni] };
      setChordAt(i, { quality: next.quality });
      previewChord(next);
    };
    const nextTension = (dir: 1 | -1) => () => {
      const idx = TENSIONS.indexOf(c.tension);
      const ni = (idx + dir + TENSIONS.length) % TENSIONS.length;
      const next: Chord = { ...c, tension: TENSIONS[ni] };
      setChordAt(i, { tension: next.tension });
      previewChord(next);
    };
    return (
      <Card key={i}>
        <YellowLabel onClick={() => previewChord(c)} title="プレビュー再生">{label}</YellowLabel>
        <Row>
          <TriadBox>
            <SideButton pos="left"><ArrowDropDownIcon onClick={nextRoot(-1)} /></SideButton>
            <BoxLabel>{NOTES[c.rootIndex]}</BoxLabel>
            <SideButton pos="right"><ArrowDropUpIcon onClick={nextRoot(1)} /></SideButton>
          </TriadBox>
          <TriadBox>
            <SideButton pos="left"><ArrowDropDownIcon onClick={nextQuality(-1)} /></SideButton>
            <BoxLabel>{c.quality}</BoxLabel>
            <SideButton pos="right"><ArrowDropUpIcon onClick={nextQuality(1)} /></SideButton>
          </TriadBox>
          <TriadBox>
            <SideButton pos="left"><ArrowDropDownIcon onClick={nextTension(-1)} /></SideButton>
            <BoxLabel>{c.tension || '—'}</BoxLabel>
            <SideButton pos="right"><ArrowDropUpIcon onClick={nextTension(1)} /></SideButton>
          </TriadBox>
        </Row>
        <CircleRow>
          <LeftIcon fontSize="small" onClick={cycleIcon(0)} style={{ cursor: 'pointer' }} />
          <RightIcon fontSize="small" onClick={cycleIcon(1)} style={{ cursor: 'pointer' }} />
        </CircleRow>
      </Card>
    );
  }), [slots, setChordAt, setSlotPlayType]);

  return (
    <Container>
      <Grid cols={bars * 4}>
        {cards}
      </Grid>
    </Container>
  );
};
