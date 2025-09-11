import styled from '@emotion/styled';
import { scalePx } from '@/shared/lib/scale';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useBarCount } from '@entities/bar-count';
import { useSegment } from '@entities/segment';
import { RhythmSegmentEditor, MelodySegmentEditor } from '@features/segment-edit';
import { WaveformViewer } from '@features/waveform';
import { StyledArea } from '@shared/ui';

const BarWaveformContainer = styled(StyledArea)`
  position: relative;
  height: ${scalePx(180)};
  width: 100%;
  max-width: ${scalePx(600)};
  box-sizing: border-box;
  margin: 0 auto;
  align-items: flex-start;
  overflow: visible; /* 波形キャンバスが確実に見えるように */
`;

const SegmentLabel = styled(StyledArea)`
  position: absolute;
  top: 0;
  background: linear-gradient(135deg, rgba(255, 248, 56, 0.76), rgb(255, 210, 97));
  font-family: 'brandon-grotesque', sans-serif;
  font-size: ${scalePx(14)};
  padding: 0px ${scalePx(4)};
  border-radius: ${scalePx(4)};
  z-index: 10;
`;

export const BarWaveformSection = () => {
  const { barCount } = useBarCount();
  const { loopMode, rhythmSegments, melodySegments, currentSegments, waveformByBar, audioBuffers, clearWaveforms } = useSegment();

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

  // バッファやモードが変わったらキャッシュをクリアして再生成
  useEffect(() => { clearWaveforms(); }, [loopMode, audioBuffers.melody, audioBuffers.rhythm]);

  const hasSelectedSegments = useMemo(() => {
    return loopMode === 'melody'
      ? melodySegments.length > 0
      : loopMode === 'rhythm'
        ? rhythmSegments.length > 0
        : (melodySegments.length > 0 || rhythmSegments.length > 0);
  }, [loopMode, rhythmSegments.length, melodySegments.length]);

  return (
    <div ref={areaRef}>
      {Array.from({ length: barCount }).map((_, barIndex) => (
        <div style={{ height: '165px' }} key={barIndex}>
          <BarWaveformContainer>
            {/* 先にキャッシュされた画像があれば使用 */}
            {waveformByBar[barIndex] ? (
              <img src={waveformByBar[barIndex]} alt="waveform" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', zIndex: 2 }} />
            ) : null}
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
            {/* 画像が未生成の場合にCanvas描画で生成 */}
            {!waveformByBar[barIndex] && (
              <WaveformViewer barIndex={barIndex} totalBars={barCount} />
            )}
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
