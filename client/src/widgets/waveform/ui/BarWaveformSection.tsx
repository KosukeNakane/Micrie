import styled from '@emotion/styled';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useBarCount } from '@entities/bar-count';
import { useSegment } from '@entities/segment';
import { RhythmSegmentEditor, MelodySegmentEditor } from '@features/segment-edit';
import { WaveformViewer } from '@features/waveform';
import { StyledArea } from '@shared/ui';

const BarWaveformContainer = styled(StyledArea)`
  position: relative;
  height: 180px;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  margin: 0 auto;
  align-items: flex-start;
`;

const SegmentLabel = styled(StyledArea)`
  position: absolute;
  top: 0;
  background: linear-gradient(135deg, rgba(255, 248, 56, 0.76), rgb(255, 210, 97));
  font-family: 'brandon-grotesque', sans-serif;
  font-size: 14px;
  padding: 0px 4px;
  border-radius: 4px;
  z-index: 10;
`;

export const BarWaveformSection = () => {
  const { barCount } = useBarCount();
  const { loopMode, rhythmSegments, melodySegments, currentSegments } = useSegment();

  // WaveformViewerは幅600固定のため、ラベル位置も600基準で整合させる
  const [canvasWidth, setCanvasWidth] = useState(600);
  const areaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = areaRef.current; if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setCanvasWidth(Math.round(Math.min(rect.width, 600)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  const hasSelectedSegments = useMemo(() => {
    return loopMode === 'melody'
      ? melodySegments.length > 0
      : loopMode === 'rhythm'
      ? rhythmSegments.length > 0
      : (melodySegments.length > 0 || rhythmSegments.length > 0);
  }, [loopMode, rhythmSegments.length, melodySegments.length]);

  if (!hasSelectedSegments) return null;

  return (
    <div ref={areaRef}>
      {Array.from({ length: barCount }).map((_, barIndex) => (
        <div style={{ height: '220px' }} key={barIndex}>
          <BarWaveformContainer>
            {loopMode === 'both' ? (
              <>
                {rhythmSegments.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
                  const x = Math.floor(((i + 0.5) / 16) * canvasWidth);
                  return seg.label !== 'rest' && (
                    <SegmentLabel key={`rhythm-${seg.label}-${barIndex * 16 + i}`} style={{ left: `${x}px`, top: `-10px`, transform: 'translateX(-50%)' }}>
                      {seg.label}
                    </SegmentLabel>
                  );
                })}
                {melodySegments.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
                  const x = Math.floor(((i + 0.5) / 16) * canvasWidth);
                  return seg.label !== 'rest' && (
                    <SegmentLabel key={`melody-${seg.label}-${barIndex * 16 + i}`} style={{ left: `${x}px`, top: `65px`, transform: 'translateX(-50%)' }}>
                      {seg.label}
                    </SegmentLabel>
                  );
                })}
              </>
            ) : (
              <>
                {currentSegments.rhythm?.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
                  const x = Math.floor(((i + 0.5) / 16) * canvasWidth);
                  return seg.label !== 'rest' && (
                    <SegmentLabel key={`rhythm-${seg.label}-${barIndex * 16 + i}`} style={{ left: `${x}px`, top: `-10px`, transform: 'translateX(-50%)' }}>
                      {seg.label}
                    </SegmentLabel>
                  );
                })}
                {currentSegments.melody?.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
                  const x = Math.floor(((i + 0.5) / 16) * canvasWidth);
                  return seg.label !== 'rest' && (
                    <SegmentLabel key={`melody-${seg.label}-${barIndex * 16 + i}`} style={{ left: `${x}px`, top: `-10px`, transform: 'translateX(-50%)' }}>
                      {seg.label}
                    </SegmentLabel>
                  );
                })}
              </>
            )}
            <WaveformViewer barIndex={barIndex} totalBars={barCount} />
            <div style={{ position: 'absolute', zIndex: 5, top: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(loopMode === 'rhythm' || loopMode === 'both') && (<RhythmSegmentEditor barIndex={barIndex} />)}
              {(loopMode === 'melody' || loopMode === 'both') && (<MelodySegmentEditor barIndex={barIndex} width={canvasWidth} />)}
            </div>
          </BarWaveformContainer>
        </div>
      ))}
    </div>
  );
};

