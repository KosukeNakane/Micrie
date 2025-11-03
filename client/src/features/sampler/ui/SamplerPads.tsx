import styled from "@emotion/styled";
import type { PointerEvent as ReactPointerEvent } from "react";

import { StyledArea } from "@/shared/ui";

import type {
  SamplerPad,
  SamplerPadStatus,
} from "@entities/audio/model/useSamplerStore";

const padBackground: Record<SamplerPadStatus, string> = {
  empty: "rgba(255, 255, 255, 0.08)",
  recording: "rgba(255, 64, 64, 0.24)",
  ready: "rgba(76, 106, 255, 0.16)",
  error: "rgba(255, 64, 64, 0.18)",
};

const padBorder: Record<SamplerPadStatus, string> = {
  empty: "rgba(255, 255, 255, 0.35)",
  recording: "rgba(255, 64, 64, 0.85)",
  ready: "rgba(76, 106, 255, 0.7)",
  error: "rgba(255, 64, 64, 0.85)",
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

const PadsGrid = styled(StyledArea)`
  background: transparent;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: 0;
  padding: 0 32px;
  margin: 0 32px;
  display: grid;
  grid-template-columns: repeat(5, 100px);
  gap: 8px;
  width: 100%;
  max-width: 600px;
  justify-content: center;
  position: relative;
`;

const PadButton = styled.button<{ status: SamplerPadStatus }>`
  all: unset;
  width: 100px;
  height: 100px;
  border-radius: 14px;
  border: 2px solid ${({ status }) => padBorder[status]};
  background: ${({ status }) => padBackground[status]};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  cursor: ${({ status }) => (status === "recording" ? "grabbing" : "pointer")};
  color: rgba(5, 4, 69, 0.9);
  transition: background-color 0.18s ease, border-color 0.18s ease,
    transform 0.08s ease;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 8px 18px rgba(5, 4, 69, 0.08);
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid rgba(76, 106, 255, 0.85);
    outline-offset: 3px;
  }
`;

const PadTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const PadHint = styled.span`
  font-size: 11px;
  opacity: 0.82;
  text-align: center;
  line-height: 1.2;
`;

const PadMeta = styled.span`
  font-size: 10px;
  opacity: 0.65;
  letter-spacing: 0.04em;
  text-align: center;
`;

const RecordingDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 64, 64, 0.88);
  animation: recordingPulse 1s ease-in-out infinite;

  @keyframes recordingPulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.4);
      opacity: 0.45;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

type SamplerPadsProps = {
  pads: SamplerPad[];
  recordingPadIndex: number | null;
  onPadPointerDown: (
    index: number
  ) => (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPadPointerUp: (
    index: number
  ) => (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPadPointerLeave: (
    index: number
  ) => (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPadPointerCancel: (
    index: number
  ) => (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPadClick: (index: number) => () => void;
  getPadHint: (pad: SamplerPad) => string;
  getPadMeta: (pad: SamplerPad) => string | undefined;
};

export const SamplerPads = ({
  pads,
  recordingPadIndex,
  onPadPointerDown,
  onPadPointerUp,
  onPadPointerLeave,
  onPadPointerCancel,
  onPadClick,
  getPadHint,
  getPadMeta,
}: SamplerPadsProps) => {
  return (
    <Container>
      <PadsGrid>
        {pads.map((pad, index) => {
          const isRecordingOtherPad =
            recordingPadIndex != null && recordingPadIndex !== index;
          const pointerDown = onPadPointerDown(index);
          const pointerUp = onPadPointerUp(index);
          const pointerLeave = onPadPointerLeave(index);
          const pointerCancel = onPadPointerCancel(index);
          const clickHandler = onPadClick(index);
          const meta = getPadMeta(pad);

          return (
            <PadButton
              key={index}
              type="button"
              status={pad.status}
              onPointerDown={pointerDown}
              onPointerUp={pointerUp}
              onPointerLeave={pointerLeave}
              onPointerCancel={pointerCancel}
              onClick={clickHandler}
              disabled={isRecordingOtherPad}
              onContextMenu={(event) => event.preventDefault()}
            >
              {pad.status === "recording" ? <RecordingDot /> : null}
              <PadTitle>{`Pad ${index + 1}`}</PadTitle>
              <PadHint>{getPadHint(pad)}</PadHint>
              {meta ? <PadMeta>{meta}</PadMeta> : null}
            </PadButton>
          );
        })}
      </PadsGrid>
    </Container>
  );
};
