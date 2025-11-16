// [Story] widgets/ui - BarWaveformSection.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import React, { useEffect } from 'react';

import { GlobalAudioProvider } from '@entities/audio/model/GlobalAudioContext';
import { BarCountProvider, useBarCount } from '@entities/bar-count';
import { ScaleModeProvider } from '@entities/scale-mode';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';
import { SegmentProvider, useSegment } from '@entities/segment/model/SegmentContext';

import { BarWaveformSection } from './BarWaveformSection';

import type { Meta, StoryObj } from '@storybook/react-vite';



const SetupState: React.FC<{ bars?: number }> = ({ bars = 1 }) => {
  const { setBarCount } = useBarCount();
  const { setLoopMode } = useSegment();
  const { setMelodySegments, setRhythmSegments } = usePatternEditor();
  useEffect(() => {
    setBarCount(bars);
    setLoopMode('melody');
    // 1小節=16ステップのダミーセグメントを投入
    const mkMelody = Array.from({ length: 16 * bars }, (_, i) => ({
      label: ['C4','D4','E4','F4','G4','A4','B4','C5'][i % 8],
      note: ['C4','D4','E4','F4','G4','A4','B4','C5'][i % 8],
      start: i / 16,
      end: (i + 1) / 16,
    }));
    setMelodySegments(mkMelody as any);
    setRhythmSegments(Array.from({ length: 16 * bars }, (_, i) => ({ label: 'rest', start: i/16, end: (i+1)/16 })) as any);
  }, [bars, setBarCount, setLoopMode, setMelodySegments, setRhythmSegments]);
  return null;
};

const meta: Meta<typeof BarWaveformSection> = {
  title: 'Widgets/BarWaveformSection',
  component: BarWaveformSection,
  decorators: [
    (Story) => (
      <GlobalAudioProvider>
        <SegmentProvider>
          <BarCountProvider>
            <ScaleModeProvider>
              <SetupState bars={1} />
              <div style={{ padding: 12 }}>
                <Story />
              </div>
            </ScaleModeProvider>
          </BarCountProvider>
        </SegmentProvider>
      </GlobalAudioProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
