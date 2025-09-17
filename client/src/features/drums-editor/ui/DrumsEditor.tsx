// [UI] features/ui - DrumsEditor.tsx
// 役割: 表示・入力のUIコンポーネント（3行×16マス、右端にラベル）
import styled from '@emotion/styled';
import React, { useEffect, useMemo } from 'react';
import * as Tone from 'tone';

import { StyledArea } from '@/shared/ui';
import { useSegment } from '@/entities/segment';
import { useTransportStore } from '@/entities/transport';

const STEPS = 16;
const ROWS = [
  { key: 'kick', label: 'KICK' },
  { key: 'snare', label: 'SNARE' },
  { key: 'hihat', label: 'HIHAT' },
] as const;

const Container = styled(StyledArea)`
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  box-shadow: none;
  gap: 10px;
  flex-direction: column;
  align-items: stretch;
  max-width: 1050px;
  margin-top: 8px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 64px repeat(${STEPS}, minmax(32px, 1fr)); /* 左ラベル + 16ステップ */
  gap: 6px;
  align-items: stretch;
`;

const StepCell = styled(StyledArea) <{ playing?: boolean; assigned?: boolean; color?: string }>`
  margin: 0;
  padding: 0;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1; /* 正方形 */
  cursor: pointer;
  /* Unassigned = invisible cell */
  background: transparent;
  border: none;
  box-shadow: none;
  outline: none;
  ${(p) => p.assigned && p.color ? `
    background: linear-gradient(135deg, ${p.color}90, ${p.color}20);
    border: 1px solid ${p.color}55;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3);
  ` : ''}
  ${(p) => p.playing && p.color ? `
    outline: 2px solid ${p.color};
    box-shadow: 0 0 0 2px rgba(255,255,255,0.75) inset, 0 0 14px ${p.color};
    background: linear-gradient(135deg, ${p.color}66, ${p.color}33);
  ` : ''}
`;

const LabelCell = styled(StyledArea)`
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  letter-spacing: 0.5px;
`;

const colorMap: Record<typeof ROWS[number]['key'], string> = {
  kick: '#ff4d4f',
  snare: '#ffd166',
  hihat: '#5ab4ff',
};

export const DrumsEditor: React.FC = () => {
  const { rhythmSegments, setRhythmSegments, updateRhythmSegment } = useSegment();
  const [playingIndex, setPlayingIndex] = React.useState<number | null>(null);

  // Ensure 16-step structure exists
  useEffect(() => {
    if ((rhythmSegments?.length ?? 0) === STEPS) return;
    const stepDur = 0.5; // 8th note
    const next = Array.from({ length: STEPS }, (_, i) => ({
      label: rhythmSegments[i]?.label ?? '',
      start: i * stepDur,
      end: (i + 1) * stepDur,
    }));
    setRhythmSegments(next as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track Transport position continuously to ensure step highlight updates reliably
  const isLoopPlaying = useTransportStore((s) => s.isLoopPlaying);
  useEffect(() => {
    let rafId: number | null = null;
    const loop = () => {
      try {
        const transport = Tone.getTransport();
        const posStr = String(transport.position || '0:0:0');
        const [barsStr, beatsStr, sixStr] = posStr.split(':');
        const barsPos = Number(barsStr) || 0;
        const beatsPos = Number(beatsStr) || 0;
        const sixPos = Number(sixStr) || 0;
        const stepInBar = beatsPos * 2 + Math.floor(sixPos / 2); // 0..7 at 8th grid
        const step2bars = (barsPos % 2) * 8 + stepInBar; // 0..15 across 2 bars
        setPlayingIndex(step2bars);
      } catch { }
      rafId = requestAnimationFrame(loop);
    };
    if (isLoopPlaying) {
      rafId = requestAnimationFrame(loop);
    } else {
      setPlayingIndex(null);
    }
    return () => { if (rafId != null) cancelAnimationFrame(rafId); };
  }, [isLoopPlaying]);

  const labels = useMemo(() => Array.from({ length: STEPS }, (_, i) => rhythmSegments[i]?.label ?? ''), [rhythmSegments]);

  const handleToggle = (rowKey: typeof ROWS[number]['key'], stepIndex: number) => {
    const curr = labels[stepIndex];
    const next = curr === rowKey ? '' : rowKey;
    updateRhythmSegment(stepIndex, { label: next } as any);
  };

  return (
    <Container>
      {ROWS.map((r) => (
        <Row key={r.key}>
          <LabelCell>{r.label}</LabelCell>
          {Array.from({ length: STEPS }).map((_, i) => {
            const assigned = labels[i] === r.key;
            const playing = assigned && playingIndex === i;
            return (
              <StepCell
                key={i}
                role="button"
                aria-pressed={assigned}
                assigned={assigned}
                playing={playing}
                color={colorMap[r.key]}
                onClick={() => handleToggle(r.key, i)}
                title={`${r.label} step ${i + 1}`}
              />
            );
          })}
        </Row>
      ))}
    </Container>
  );
};
