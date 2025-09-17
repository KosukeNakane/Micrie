// [UI] features/ui - DrumsEditor.tsx
// 役割: 表示・入力のUIコンポーネント（3行×16マス、右端にラベル）
import styled from '@emotion/styled';
import React from 'react';

import { StyledArea } from '@/shared/ui';

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
  grid-template-columns: 64px repeat(${STEPS}, minmax(32px, 1fr)) ; /* 16ステップ + 右端ラベル */
  gap: 6px;
  align-items: stretch;
`;

const StepCell = styled(StyledArea)`
  margin: 0;
  padding: 0;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1; /* 正方形 */
`;

const LabelCell = styled(StyledArea)`
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  letter-spacing: 0.5px;
`;

export const DrumsEditor: React.FC = () => {
  return (
    <Container>
      {ROWS.map((r) => (
        <Row key={r.key}>
          <LabelCell>{r.label}</LabelCell>
          {Array.from({ length: STEPS }).map((_, i) => (
            <StepCell key={i} />
          ))}
        </Row>
      ))}
    </Container>
  );
};
