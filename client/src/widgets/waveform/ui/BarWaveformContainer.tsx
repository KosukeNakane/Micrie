import { StyledArea } from "@/shared/ui";
import React, { useMemo } from "react";
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
        height: 480,
        margin: '12px auto',
        padding: 16,
        gap: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        overflow: 'auto',
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
