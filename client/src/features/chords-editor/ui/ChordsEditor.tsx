import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { StyledArea } from '@/shared/ui';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CircleIcon from '@mui/icons-material/Circle';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(255, 248, 56, 0.9), rgb(255, 210, 97));
  color: #2b2b2b;
  font-weight: 700;
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
  // 左から3つのカードを想定（必要に応じて増やせます）
  const [chords, setChords] = useState<Chord[]>([
    { rootIndex: 5, quality: 'maj', tension: 'maj7' }, // Fmaj7
    { rootIndex: 5, quality: 'maj', tension: 'maj7' }, // Fmaj7
    { rootIndex: 4, quality: 'maj', tension: '7' },    // E7
    { rootIndex: 4, quality: 'maj', tension: '7' },    // E7
    { rootIndex: 9, quality: 'min', tension: '7' },    // Am7
    { rootIndex: 9, quality: 'min', tension: '7' },    // Am7
    { rootIndex: 7, quality: 'min', tension: '7' },    // Gm7
    { rootIndex: 0, quality: 'maj', tension: '7' },    // C7
  ]);

  const update = (i: number, next: Partial<Chord>) => {
    setChords((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...next } : c)));
  };

  const cards = useMemo(() => chords.map((c, i) => {
    const label = formatChord(c);
    const nextRoot = (dir: 1 | -1) => () => update(i, { rootIndex: (c.rootIndex + dir + 12) % 12 });
    const nextQuality = (dir: 1 | -1) => () => {
      const idx = QUALITIES.indexOf(c.quality);
      const ni = (idx + dir + QUALITIES.length) % QUALITIES.length;
      update(i, { quality: QUALITIES[ni] });
    };
    const nextTension = (dir: 1 | -1) => () => {
      const idx = TENSIONS.indexOf(c.tension);
      const ni = (idx + dir + TENSIONS.length) % TENSIONS.length;
      update(i, { tension: TENSIONS[ni] });
    };
    return (
      <Card key={i}>
        <YellowLabel>{label}</YellowLabel>
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
          <CircleIcon fontSize="small" />
          <PanoramaFishEyeIcon fontSize="small" />
        </CircleRow>
      </Card>
    );
  }), [chords]);

  return (
    <Container>
      <Grid>
        {cards}
      </Grid>
    </Container>
  );
};
