// [UI] widgets/ui - WaveformTabs.tsx
// 役割: 表示・入力のUIコンポーネント
import { Tabs } from "@chakra-ui/react";
import React from "react";

type Props = {
  melody?: React.ReactNode;
  chords?: React.ReactNode;
  drums?: React.ReactNode;
  defaultTab?: "melody" | "chords" | "drums";
};

export const WaveformTabs: React.FC<Props> = ({ melody, chords, drums, defaultTab = "melody" }) => {
  return (
    <Tabs.Root defaultValue={defaultTab}>
      <Tabs.List display="flex" justifyContent="center">
        <Tabs.Trigger
          value="melody"
          width="350px"
          height="60px"
          fontWeight="700"
          borderRadius="8px 0 0 8px"
        >
          MELODY
        </Tabs.Trigger>
        <Tabs.Trigger
          value="chords"
          width="350px"
          height="60px"
          fontWeight="700"
        >
          CHORDS
        </Tabs.Trigger>
        <Tabs.Trigger
          value="drums"
          width="350px"
          height="60px"
          fontWeight="700"
          borderRadius="0 8px 8px 0"
        >
          DRUMS
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="melody" p={0} mt={2}>
        {melody}
      </Tabs.Content>
      <Tabs.Content value="chords" p={0} mt={2}>
        {chords}
      </Tabs.Content>
      <Tabs.Content value="drums" p={0} mt={2}>
        {drums}
      </Tabs.Content>
    </Tabs.Root>
  );
};
