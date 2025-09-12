import styled from "@emotion/styled";
import { StyledArea } from "@/shared/ui";
import React from "react";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 12px;
`;

const Card = styled(StyledArea)`
  width: 128px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MelodyCards: React.FC = () => {
  return (
    <Container>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} />
      ))}
    </Container>
  );
};

