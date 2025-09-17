// [UI] widgets/ui - BarWaveformContainer.tsx
// 役割: 表示・入力のUIコンポーネント
import React, { useMemo } from "react";

import { StyledArea } from "@/shared/ui";

import { WaveformTabs } from "./WaveformTabs";

type Props = {
  children?: React.ReactNode;
  melody?: React.ReactNode;
  chords?: React.ReactNode;
  drums?: React.ReactNode;
  defaultTab?: "melody" | "chords" | "drums";
};

export const BarWaveformContainer: React.FC<Props> = ({ children, melody, chords, drums, defaultTab = "melody" }) => {
  const melodyContent = useMemo(() => melody ?? null, [melody]);
  const chordsContent = useMemo(() => chords ?? null, [chords]);
  const drumsContent = useMemo(() => drums ?? null, [drums]);

  return (
    <StyledArea
      style={{
        width: 1050,
        height: 544, // +64px to reduce need for inner scrolling
        margin: '12px auto',
        padding: 16,
        gap: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        overflow: 'visible',
      }}
    >
      <WaveformTabs
        melody={melodyContent}
        chords={chordsContent}
        drums={drumsContent}
        defaultTab={defaultTab}
      />
    </StyledArea>
  );
};
