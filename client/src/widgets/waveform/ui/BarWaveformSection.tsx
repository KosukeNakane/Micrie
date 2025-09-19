// [UI] widgets/ui - BarWaveformSection.tsx
// 役割: 表示・入力のUIコンポーネント
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import { useSegment } from '@entities/segment';
import { MelodyEditor } from '@features/melody-editor';
import { StyledArea } from '@shared/ui';

import { RhythmSegmentEditor } from '@/features/rhythm-segment-edit';
import { scalePx } from '@/shared/lib/scale';

const BarWaveformCard = styled(StyledArea)`
  position: relative;
  height: ${scalePx(180)};
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  align-items: flex-start;
  overflow: visible; /* 波形キャンバスが確実に見えるように */
  /* Glass背景が重なって白飛びするのを避けるため無効化 */
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  box-shadow: none;
`;

export const BarWaveformSection = () => {
  const { loopMode, } = useSegment();

  // WaveformViewerは幅600固定のため、ラベル位置も600基準で整合させる
  const [canvasWidth, setCanvasWidth] = useState(600);
  const areaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = areaRef.current; if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      // 2bar 横並び前提: 1bar あたりの幅を親幅の半分(隙間4px考慮)か最大600に制限
      const perBar = Math.floor(Math.min(rect.width / 2 - 4, 600));
      setCanvasWidth(perBar > 0 ? perBar : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  return (
    <div ref={areaRef}>
      <div style={{ height: '165px', display: 'flex', justifyContent: 'center' }}>
        <BarWaveformCard>
          {/* セグメントラベルのオーバーレイ表示は無効化（MelodySegmentEditor由来に見える重複ラベル防止） */}
          {/* 波形背景表示は削除 */}
          <div style={{ position: 'absolute', zIndex: 20, top: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', paddingTop: '8px', boxSizing: 'border-box', pointerEvents: 'auto' }}>
            {(loopMode === 'rhythm' || loopMode === 'both') && (<RhythmSegmentEditor barIndex={0} width={canvasWidth} />)}
            {(loopMode === 'melody' || loopMode === 'both') && (
              <MelodyEditor barIndex={0} width={canvasWidth} />
            )}
          </div>
        </BarWaveformCard>
      </div>
    </div>
  );
};
