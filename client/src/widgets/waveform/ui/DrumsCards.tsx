// [UI] widgets/ui - DrumsCards.tsx
// 役割: 表示・入力のUIコンポーネント（ChordsCards と同じUI）
import styled from "@emotion/styled";
import React from "react";

import { StyledArea } from "@/shared/ui";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Card = styled(StyledArea)`
  width: 128px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DrumsCards: React.FC = () => {
  return (
    <Container>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} />
      ))}
    </Container>
  );
};

