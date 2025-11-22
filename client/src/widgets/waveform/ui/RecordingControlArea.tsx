// [UI] widgets/ui - RecordingControlArea.tsx
// 役割: 波形画面上部の録音コントロール（Recボタン・ビート表示・波形キャンバス）をまとめる

import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";

import { useAnalyser, useRecordingUI } from "@entities/audio";
import { useCountBarsAndBeats } from "@entities/count-bars-and-beats";
import { useSegment } from "@entities/segment";
import { useTempo } from "@entities/tempo";
import { RecordingBeatIndicator } from "@features/recording";
import { RecButton } from "@features/recording/ui/RecButton";
import { StyledArea } from "@shared/ui";

type Props = {
  isRecording: boolean;
  onToggleRecording?: () => void;
};

export const RecordingControlArea = ({ isRecording, onToggleRecording }: Props) => {
  const { currentBar, currentBeat } = useCountBarsAndBeats();
  const { isDrawing, setIsDrawing } = useRecordingUI();
  const { tempo } = useTempo();
  const tempoRef = useRef(tempo);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(600);
  const canvasRef = useAnalyser();
  const { currentBuffer } = useSegment();
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);

  useEffect(() => {
    if (!isRecording) {
      setIsDrawing(false);
      return;
    }
    setIsDrawing(true);
  }, [isRecording, setIsDrawing]);

  useEffect(() => {
    if (canvasRef.current && currentBuffer) {
      setIsDrawing(true);
    }
  }, [currentBuffer, setIsDrawing]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateDimensions = () => {
      const rect = element.getBoundingClientRect();
      setCanvasWidth(rect.width);
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(element);
    window.addEventListener("resize", updateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (!isRecording) {
      setIsHighlighted(false);
      return;
    }
    setIsHighlighted(true);
    const interval = (60 / tempoRef.current) * 1000;
    const timer = window.setInterval(() => {
      setIsHighlighted((prev) => !prev);
    }, interval);
    return () => {
      window.clearInterval(timer);
    };
  }, [isRecording]);

  const handleRecClick = () => {
    onToggleRecording?.();
  };

  return (
    <Container>
      <HeaderGrid>
        <BeatIndicatorWrapper>
          <RecordingBeatIndicator currentBar={currentBar} currentBeat={currentBeat} size="sm" />
        </BeatIndicatorWrapper>
        <RecButton onClick={handleRecClick} />
        <div />
      </HeaderGrid>
      <WaveformArea ref={containerRef} isHighlighted={isHighlighted}>
        {isDrawing ? (
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={100}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
              width: "100%",
              height: "100%",
            }}
          />
        ) : null}
      </WaveformArea>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HeaderGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 0;
`;

const BeatIndicatorWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: 0;
`;

const WaveformArea = styled(StyledArea)<{ isHighlighted: boolean }>`
  position: relative;
  height: 100px;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0;
  width: 424px;
  margin: 0 auto 8px;
  background-color: ${({ isHighlighted }) => (isHighlighted ? "rgba(255, 0, 0, 0.2)" : "transparent")};
  transition: none;
`;
